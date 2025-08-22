import multer from "multer";
import fs from "fs";
import path from "path";
import Usuario from "../models/Usuario.js";
import Documentos from "../models/Documentos.js";

// Carpeta de almacenamiento
const UPLOADS_DIR = path.resolve("documentos-formatos");

// Configuración de Multer con validación previa
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

// 🚦 Validación ANTES de guardar archivo
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

    // ✅ Guardamos el usuario en req
    req.usuario = usuario;
    cb(null, true);
  } catch (error) {
    cb(new Error("Error en la validación del archivo"), false);
  }
};


export const upload = multer({ storage, fileFilter });

// Subir documento
export const subirDocumento = async (req, res) => {
  try {
    const { tipo } = req.body;
    const archivo = req.file;
    const usuario = req.usuario; // ← ya lo tenés desde el fileFilter

    if (!archivo) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    // 1. Buscar si ya existe un registro en documentos
    let documento = await Documentos.query().findOne({ usuario: usuario.id });

    if (!documento) {
      documento = await Documentos.query().insert({
        usuario: usuario.id,
        archivo1: tipo === "1" ? archivo.filename : null,
        archivo2: tipo === "2" ? archivo.filename : null,
        estado_id: 1,
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
