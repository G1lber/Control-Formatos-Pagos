import multer from "multer";
import fs from "fs";
import path from "path";
import Usuario from "../models/Usuario.js";
import Documentos from "../models/Documentos.js";
import { PDFDocument, rgb } from "pdf-lib";
import { sendMail } from "../config/mailer.js"
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { log } from "console";
import Documento from "../models/Documentos.js";
import { validarNumeroPlanilla } from "../utils/validacionesGF.js";



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

// Insertar Marcador de donde ira la firma
export const insertarMarcadorFirma = async (req, res) => {
  try {
    const { file, posicion } = req.body;
    const filePath = path.resolve("documentos-formatos", file);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const content = fs.readFileSync(filePath, "binary");
    const zip = new PizZip(content);

    // Obtener XML principal
    const xml = zip.file("word/document.xml").asText();
    const $ = cheerio.load(xml, { xmlMode: true });

    const paragraphs = $("w\\:p");
    let idx = Number(posicion);

    if (!Number.isInteger(idx) || idx < 0 || idx >= paragraphs.length) {
      idx = paragraphs.length - 1;
    }

    // Insertamos el marcador {firma} en ese párrafo
    const newRun = `
      <w:r>
        <w:t xml:space="preserve">{%firma}</w:t>
      </w:r>
    `;

    $(paragraphs[idx]).append(newRun);

    // Guardar XML de vuelta en el zip
    zip.file("word/document.xml", $.xml());

    const buffer = zip.generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    fs.writeFileSync(filePath, buffer);

    return res.json({ message: "Marcador {firma} insertado ✅" });
  } catch (err) {
    console.error("❌ Error insertando marcador:", err);
    return res.status(500).json({ error: "Error insertando marcador" });
  }
};

//Firmar Word
function getImageModule() {
  return new ImageModule({
    centered: true,
    getImage: (tagValue) => {
      // tagValue = la ruta que pasas en doc.render()
      return fs.readFileSync(tagValue);
    },
    getSize: () => {
      return [150, 50]; // ancho, alto en px
    },
  });
}

export const firmarWord = async (req, res) => {
  let filePath;
  let firmaPath;
  try {
    const { file, documentoId } = req.body; // Validar entrada

    if (!file || !documentoId) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    filePath = path.resolve("documentos-formatos", file);
    firmaPath = path.resolve("firma", "firma.png");

    // Validar existencia de archivos
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    if (!fs.existsSync(firmaPath)) {
      return res.status(404).json({ error: "No hay firma registrada" });
    }

    // Cargar y procesar el archivo Word
    const content = fs.readFileSync(filePath, "binary");
    const zip = new PizZip(content);

    const imageModule = new ImageModule({
      getImage: (tagValue) => fs.readFileSync(tagValue),
      getSize: () => [150, 50],
    });

    const doc = new Docxtemplater(zip, { modules: [imageModule] });
    doc.render({ firma: firmaPath });

    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    fs.writeFileSync(filePath, buffer);

    // ✅ Actualizar estadoGF a 2
    await Documentos.query().findById(documentoId).patch({
      estadogf_id: 2,
    });

    // ✅ Responder rápido al cliente
    res.json({
      message: "✅ Documento firmado correctamente",
      url: `/documentos-formatos/${file}`,
    });

    // 📩 Enviar correo en segundo plano
    (async () => {
     try {
        const documento = await Documentos.query()
          .findById(documentoId)
          .withGraphFetched("usuarioRef");

        if (documento && documento.usuarioRef?.correo) {
          const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <!-- HEADER -->
            <div style="background-color: #ffffff; padding: 16px; text-align: center;">
              <img src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png" alt="Logo SENA" style="width: 100px; margin-bottom: 8px;" />
              <h2 style="color: #39A900; margin: 0;">Control de Pagos SENA</h2>
            </div>

            <!-- CUERPO -->
            <div style="padding: 20px; color: #333;">
              <p>Hola <b>${documento.usuarioRef.nombre || "Usuario"}</b>,</p>

              <p>
                El documento GC <strong>"${file}"</strong> ha sido 
                <span style="color:#2E8C00; font-weight:600;">aprobado y firmado correctamente.</span> ✅ 
              </p>

              <p>Puedes conservar el documento firmado que se adjunta a este correo.</p>

              <p style="margin-top: 20px;">Atentamente,<br><strong>Equipo Control de Pagos SENA</strong></p>
            </div>

            <!-- FOOTER -->
            <div style="background-color: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #777;">
              © ${new Date().getFullYear()} SENA - Control de Pagos<br>
              Este es un mensaje automático. Si tienes dudas, responde a este correo o contacta al equipo de Control de Pagos.
            </div>
          </div>
          `;

          try {
            await sendMail(
              documento.usuarioRef.correo,
              "✅ Documento aprobado - Control de Pagos SENA",
              emailHtml,
              [{ filename: file, path: filePath }]
            );
            console.log("✅ Correo enviado con éxito");
          } catch (err) {
            console.error("❌ Error en sendMail:", err);
          }
        } else {
          console.warn("⚠️ No se encontró correo de usuario para enviar.");
        }
      } catch (err) {
        console.error("❌ Error obteniendo documento para correo:", err);
      }
    })();
  } catch (err) {
    console.error("❌ Error firmando documento Word:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error firmando documento Word" });
    }
  }
};



// Firmar el archivo PDF
export const firmarDocumento = async (req, res) => {
  let filePath;
  let firmaPath;
  try {
    const { file, documentoId } = req.body; // nombre del archivo
    filePath = path.resolve("documentos-formatos", file);
    firmaPath = path.resolve("firma", "firma.png");

    // Validar existencia de archivos
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    if (!fs.existsSync(firmaPath)) {
      return res.status(404).json({ error: "No hay firma registrada" });
    }

    // --- Cargar PDF ---
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // --- Cargar firma ---
    const firmaBytes = fs.readFileSync(firmaPath);
    let firmaImage;

    if (firmaPath.endsWith(".png")) {
      firmaImage = await pdfDoc.embedPng(firmaBytes);
    } else if (firmaPath.endsWith(".jpg") || firmaPath.endsWith(".jpeg")) {
      firmaImage = await pdfDoc.embedJpg(firmaBytes);
    } else {
      throw new Error("La firma debe ser PNG o JPG");
    }

    // Insertar firma en la primera página
    const firstPage = pdfDoc.getPages()[0];
    firstPage.drawImage(firmaImage, {
      x: 460,
      y: 110,
      width: 100,
      height: 25,
    });

    // Guardar el PDF firmado
    const signedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, signedPdfBytes);

    // ✅ Actualizar estadoGF a 2
    await Documentos.query().findById(documentoId).patch({
      estadogf_id: 2,
    });

    // Responder rápido al frontend
    res.json({
      message: "Documento firmado correctamente ✅",
      url: `/documentos-formatos/${file}`,
    });

    // --- Enviar correo en segundo plano ---
    (async () => {
      try {
        const documento = await Documentos.query()
          .findById(documentoId)
          .withGraphFetched("usuarioRef");

        if (documento && documento.usuarioRef?.correo) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- HEADER -->
              <div style="background-color: #ffffff; padding: 16px; text-align: center;">
                <img src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png" alt="Logo SENA" style="width: 100px; margin-bottom: 8px;" />
                <h2 style="color: #39A900; margin: 0;">Control de Pagos SENA</h2>
              </div>

              <!-- CUERPO -->
              <div style="padding: 20px; color: #333;">
                <p>Hola <b>${documento.usuarioRef.nombre || "Usuario"}</b>,</p>

                <p>
                  Nos complace informarte que tu documento GC <strong>"${file}"</strong> ha sido 
                  <span style="color:#2E8C00; font-weight:600;">Aprobado y firmado correctamente</span>.
                </p>

                <p>📎 El documento aprobado se adjunta a este correo para tu referencia.</p>

                <p style="margin-top: 20px;">Atentamente,<br><strong>Equipo Control de Pagos SENA</strong></p>
              </div>

              <!-- FOOTER -->
              <div style="background-color: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #777;">
                © ${new Date().getFullYear()} SENA - Control de Pagos<br>
                Este es un mensaje automático. Si tienes dudas, responde a este correo o contacta al equipo de Control de Pagos.
              </div>
            </div>
          `;

          await sendMail(
            documento.usuarioRef.correo,
            "✅ Documento aprobado - Control de Pagos SENA",
            emailHtml,
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
    const firmaDir = path.resolve("firma");
    if (!fs.existsSync(firmaDir)) fs.mkdirSync(firmaDir, { recursive: true });

    const firmaPath = path.join(firmaDir, "firma.png");

    // Eliminar firma previa
    if (fs.existsSync(firmaPath)) fs.unlinkSync(firmaPath);

    // Convertir la imagen a PNG y guardarla
    await sharp(archivo.path)
      .png()
      .toFile(firmaPath);

    // Borrar archivo temporal subido
    fs.unlinkSync(archivo.path);

    res.json({ mensaje: "✅ Firma actualizada y convertida a PNG", archivo: "firma.png" });
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
    const { tipo } = req.body; // "1" o "2"
    const archivo = req.file;
    const usuario = req.usuario;

    if (!archivo) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    const rutaPDF = path.join(UPLOADS_DIR, archivo.filename);

    // ⚡ Validar número de planilla si es tipo 1
    if (tipo === "1") {
      try {
        const numeroPlanilla = await validarNumeroPlanilla(rutaPDF);
        console.log(`✅ Número de planilla validado: ${numeroPlanilla}`);
        // Opcional: podrías guardar este número en la BD
      } catch (errValid) {
        // ❌ Si falla la validación, borrar el archivo y salir
        if (fs.existsSync(rutaPDF)) {
          fs.unlinkSync(rutaPDF);
        }
        return res.status(400).json({ error: errValid.message });
      }
    }

    // 🔹 Buscar si ya existe documento para ese usuario
    let documento = await Documentos.query().findOne({ usuario: usuario.id });

    if (!documento) {
      if (tipo === "1") {
        documento = await Documentos.query().insert({
          usuario: usuario.id,
          archivo1: archivo.filename,
          estadogf_id: 1,
        });
      } else if (tipo === "2") {
        documento = await Documentos.query().insert({
          usuario: usuario.id,
          archivo2: archivo.filename,
          estadogc_id: 1,
        });
      }
    } else {
      if (tipo === "1") {
        if (documento.archivo1) {
          const oldPath = path.join(UPLOADS_DIR, documento.archivo1);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        documento = await documento.$query().patchAndFetch({
          archivo1: archivo.filename,
          estadogf_id: 1,
        });
      } else if (tipo === "2") {
        if (documento.archivo2) {
          const oldPath = path.join(UPLOADS_DIR, documento.archivo2);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        documento = await documento.$query().patchAndFetch({
          archivo2: archivo.filename,
          estadogc_id: 1,
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
      .withGraphFetched("[usuarioRef, estadoGF, estadoGC]") // incluye usuario + estados GF y GC
      .orderBy("id", "desc");

    res.json(documentos);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
};

// 🔎 Obtener un documento por Id
export const obtenerDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Consulta manual con join - solo seleccionamos el nombre
    const documento = await Documento.query()
      .findById(id)
      .select('documentos.*', 'usuarios.nombre') // Solo nombre, sin numero_doc
      .join('usuarios', 'documentos.usuario', 'usuarios.id')
      .first();

    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Formatear la respuesta
    const documentoConUsuario = {
      ...documento,
      usuarioRef: {
        nombre: documento.nombre // Solo pasamos el nombre
      }
    };

    // Eliminar campo temporal
    delete documentoConUsuario.nombre;

    res.json(documentoConUsuario);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// ✏️ Actualizar estado GF
export const actualizarEstadoGF = async (req, res) => {
  try {
    const { id } = req.params;
    const { estadogf_id } = req.body;

    const documento = await Documentos.query().findById(id);

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const actualizado = await documento.$query().patchAndFetch({ estadogf_id });

    res.json({ mensaje: "Estado GF actualizado correctamente", documento: actualizado });
  } catch (error) {
    console.error("Error al actualizar estado GF:", error);
    res.status(500).json({ error: "Error al actualizar estado GF" });
  }
};

// ✏️ Actualizar estado GC
export const actualizarEstadoGC = async (req, res) => {
  try {
    const { id } = req.params;
    const { estadogc_id } = req.body;

    const documento = await Documentos.query().findById(id);

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const actualizado = await documento.$query().patchAndFetch({ estadogc_id });

    res.json({ mensaje: "Estado GC actualizado correctamente", documento: actualizado });
  } catch (error) {
    console.error("Error al actualizar estado GC:", error);
    res.status(500).json({ error: "Error al actualizar estado GC" });
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
