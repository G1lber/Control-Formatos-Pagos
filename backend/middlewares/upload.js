import multer from "multer";
import path from "path";
import fs from "fs";

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve("formatos-pagos"); 
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // 👈 crea la carpeta si no existe
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_")
    );
  },
});

const upload = multer({ storage });

export default upload;
