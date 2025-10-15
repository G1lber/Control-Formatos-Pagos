const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📂 Carpeta documentos
const DOCUMENTOS_DIR = path.resolve("formatos-pagos");
if (!fs.existsSync(DOCUMENTOS_DIR)) fs.mkdirSync(DOCUMENTOS_DIR, { recursive: true });

// 📂 Carpeta firmas
const FIRMAS_DIR = path.resolve("firma");
if (!fs.existsSync(FIRMAS_DIR)) fs.mkdirSync(FIRMAS_DIR, { recursive: true });

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

// ✅ Limitar tamaño de archivo y validar tipo
const fileFilterFirma = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Formato de archivo no permitido. Solo PNG o JPG");
    error.code = "LIMIT_FILE_TYPE";
    return cb(error, false);
  }
  cb(null, true);
};

const uploadDocs = multer({ storage: storageDocs });
const uploadFirma = multer({
  storage: storageFirmas,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: fileFilterFirma,
});

module.exports = { uploadDocs, uploadFirma };
