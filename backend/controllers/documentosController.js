import multer from "multer";
import fs from "fs";
import path from "path";
import Usuario from "../models/Usuario.js";
import Documentos from "../models/Documentos.js";

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve("documentos-formatos");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// Subir documento (archivo1 o archivo2)
export const subirDocumento = async (req, res) => {
  try {
    const { numero_doc, tipo } = req.body;
    const archivo = req.file;

    if (!numero_doc) {
      return res.status(400).json({ error: "Se requiere el número de documento del usuario" });
    }

    if (!archivo) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    if (tipo !== "1" && tipo !== "2") {
      return res.status(400).json({ error: "El campo 'tipo' debe ser '1' o '2'" });
    }

    // 1. Buscar usuario por número de documento
    const usuario = await Usuario.query().findOne({ numero_doc });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 2. Buscar si ya existe un registro en documentos para ese usuario
    let documento = await Documentos.query().findOne({ usuario: usuario.id });

    if (!documento) {
      // Si no existe, crear uno nuevo
      documento = await Documentos.query().insert({
        usuario: usuario.id, // 👈 aquí usamos "usuario"
        archivo1: tipo === "1" ? archivo.filename : null,
        archivo2: tipo === "2" ? archivo.filename : null,
        estado_id: 1,
      });
    } else {
      // Si existe, actualizar según el tipo
      if (tipo === "1") {
        if (documento.archivo1) {
          const oldPath = path.resolve("uploads", documento.archivo1);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        documento = await documento.$query().patchAndFetch({
          archivo1: archivo.filename,
        });
      } else if (tipo === "2") {
        if (documento.archivo2) {
          const oldPath = path.resolve("uploads", documento.archivo2);
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
