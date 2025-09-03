import multer from "multer";
import path from "path";
import fs from "fs";

// 📂 Carpeta documentos
const DOCUMENTOS_DIR = path.resolve("formatos-pagos");
if (!fs.existsSync(DOCUMENTOS_DIR)) {
  fs.mkdirSync(DOCUMENTOS_DIR, { recursive: true });
}

// 📂 Carpeta firmas
const FIRMAS_DIR = path.resolve("firma");
if (!fs.existsSync(FIRMAS_DIR)) {
  fs.mkdirSync(FIRMAS_DIR, { recursive: true });
}

// --- Configuración documentos ---
const storageDocs = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOCUMENTOS_DIR),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

// --- Configuración firmas ---
const storageFirmas = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FIRMAS_DIR),
  filename: (req, file, cb) => {
    cb(null, "firma-" + Date.now() + path.extname(file.originalname));
  },
});

export const uploadDocs = multer({ storage: storageDocs });
export const uploadFirma = multer({ storage: storageFirmas });