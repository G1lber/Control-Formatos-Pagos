import multer from "multer";
import fs from "fs";
import path from "path";
import Usuario from "../models/Usuario.js";
import Documentos from "../models/Documentos.js";
import { PDFDocument, rgb } from "pdf-lib";
import { sendMail } from "../config/mailer.js"


const UPLOADS_DIR = path.resolve("documentos-formatos");
const FIRMAS_DIR = path.resolve("firma");

// --- Configuración Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Configuracion para la firma Multer
const storageFirmas = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(FIRMAS_DIR)) {
      fs.mkdirSync(FIRMAS_DIR, { recursive: true });
    }
    cb(null, FIRMAS_DIR); // <- Guarda en otra carpeta
  },
  filename: (req, file, cb) => {
    const uniqueName = "firma-" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName); // <- Nombre final de la firma
  },
});


const fileFilter = async (req, file, cb) => {
  try {
    const { numero_doc, tipo } = req.body;

    if (!numero_doc) {
      return cb(new Error("Se requiere el número de documento"), false);
    }

    if (tipo !== "1" && tipo !== "2") {
      return cb(new Error("El campo 'tipo' debe ser '1' o '2'"), false);
    }

    // Validar si existe usuario
    const usuario = await Usuario.query().findOne({ numero_doc });

    if (!usuario) {
      return cb(new Error("Usuario no encontrado"), false);
    }

    req.usuario = usuario;
    cb(null, true);
  } catch (error) {
    cb(new Error("Error en la validación del archivo"), false);
  }
};

export const upload = multer({ storage, fileFilter });

// --- Controladores ---

// Firmar el archivo
export const firmarDocumento = async (req, res) => {
  let filePath;
  let firmaPath;
  try {
    const { file, documentoId } = req.body; // nombre del archivo
    const filePath = path.resolve("documentos-formatos", file); 
    const firmaPath = path.resolve("firma", "firma.png");

    // Validar existencia de archivos
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    if (!fs.existsSync(firmaPath)) {
      return res.status(404).json({ error: "No hay firma registrada" });
    }

    // Cargar PDF y firma
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const firmaBytes = fs.readFileSync(firmaPath);
    const firmaImage = await pdfDoc.embedPng(firmaBytes);

    // Insertar firma en la primera página
    const firstPage = pdfDoc.getPages()[0];
    firstPage.drawImage(firmaImage, {
      x: 430,
      y: 88,
      width: 140,
      height: 60,
    });

    // Guardar el archivo firmado
    const signedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, signedPdfBytes);

  // ⚡️ Responder rápido al frontend
    res.json({
      message: "Documento firmado correctamente ✅",
      url: `/documentos-formatos/${file}`,
    });

    // --- 📩 Enviar correo en segundo plano ---
    (async () => {
      try {
        const documento = await Documentos.query()
          .findById(documentoId)
          .withGraphFetched("usuarioRef");

        if (documento && documento.usuarioRef?.correo) {
          await sendMail(
            documento.usuarioRef.correo,
            "✅ Documento aprobado",
            `Su documento ${file} ha sido aprobado y firmado correctamente.`,
            [
              {
                filename: file,
                path: filePath,
              },
            ]
          );
        }
      } catch (err) {
        console.error("❌ Error enviando correo en segundo plano:", err);
      }
    })();
  } catch (err) {
    console.error("❌ Error en firmarDocumento:", err);
    res.status(500).json({ error: "Error procesando la firma del documento" });
  }
};


// Subir Firma
export const subirFirma = async (req, res) => {
  try {
    const archivo = req.file;
    if (!archivo) {
      return res.status(400).json({ error: "No se envió ninguna firma" });
    }

    // Carpeta donde guardamos la firma
    const firmaPath = path.resolve("firma", "firma.png");

    // Si existe una firma previa la eliminamos
    if (fs.existsSync(firmaPath)) {
      fs.unlinkSync(firmaPath);
    }

    // Movemos el archivo subido al nombre fijo
    fs.renameSync(archivo.path, firmaPath);

    res.json({ mensaje: "✅ Firma actualizada", archivo: "firma.png" });
  } catch (error) {
    console.error("❌ Error al subir firma:", error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerFirma = (req, res) => {
  const firmaPath = path.resolve("firma", "firma.png");

  if (fs.existsSync(firmaPath)) {
    res.sendFile(firmaPath);
  } else {
    res.status(404).json({ error: "No hay firma registrada" });
  }
};

// 📤 Subir documento
export const subirDocumento = async (req, res) => {
  try {
    const { tipo } = req.body;
    const archivo = req.file;
    const usuario = req.usuario;

    if (!archivo) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    let documento = await Documentos.query().findOne({ usuario: usuario.id });

    if (!documento) {
      documento = await Documentos.query().insert({
        usuario: usuario.id,
        archivo1: tipo === "1" ? archivo.filename : null,
        archivo2: tipo === "2" ? archivo.filename : null,
        estado_id: 1, // estado inicial
      });
    } else {
      if (tipo === "1") {
        if (documento.archivo1) {
          const oldPath = path.join(UPLOADS_DIR, documento.archivo1);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        documento = await documento.$query().patchAndFetch({
          archivo1: archivo.filename,
        });
      } else if (tipo === "2") {
        if (documento.archivo2) {
          const oldPath = path.join(UPLOADS_DIR, documento.archivo2);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        documento = await documento.$query().patchAndFetch({
          archivo2: archivo.filename,
        });
      }
    }

    res.json({ mensaje: "Documento subido correctamente", documento });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 📄 Listar todos los documentos
export const obtenerDocumentos = async (req, res) => {
  try {
    const documentos = await Documentos.query()
      .withGraphFetched("[usuarioRef, estado]") // incluye usuario + estado
      .orderBy("id", "desc");

    res.json(documentos);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
};

// 🔎 Obtener un documento por ID
export const obtenerDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documentos.query()
      .findById(id)
      .withGraphFetched("[usuarioRef, estado]");

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json(documento);
  } catch (error) {
    console.error("Error al obtener documento:", error);
    res.status(500).json({ error: "Error al obtener documento" });
  }
};

// ✏️ Actualizar estado del documento
export const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_id } = req.body;

    const documento = await Documentos.query().findById(id);

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const actualizado = await documento.$query().patchAndFetch({ estado_id });

    res.json({ mensaje: "Estado actualizado correctamente", documento: actualizado });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
};

// ❌ Eliminar documento (y archivos asociados)
export const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const documento = await Documentos.query().findById(id);

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Borrar archivos físicos si existen
    if (documento.archivo1) {
      const filePath1 = path.join(UPLOADS_DIR, documento.archivo1);
      if (fs.existsSync(filePath1)) fs.unlinkSync(filePath1);
    }
    if (documento.archivo2) {
      const filePath2 = path.join(UPLOADS_DIR, documento.archivo2);
      if (fs.existsSync(filePath2)) fs.unlinkSync(filePath2);
    }

    await documento.$query().delete();

    res.json({ mensaje: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
};
