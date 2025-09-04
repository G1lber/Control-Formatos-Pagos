// backend/routes/documentosRoutes.js
import express from "express";
import {
  subirDocumento,
  upload,
  obtenerDocumentos,
  obtenerDocumentoPorId,
  actualizarEstado,
  eliminarDocumento,
  subirFirma,
  obtenerFirma,
  firmarDocumento,
  firmarWord
} from "../controllers/documentosController.js";
import { uploadFirma } from "../middlewares/upload.js";
const router = express.Router();

// 📤 Subir documento
router.post(
  "/",
  (req, res, next) => {
    upload.single("archivo")(req, res, (err) => {
      if (err) {
        // 🚨 Capturamos error del fileFilter o de Multer
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  subirDocumento
);

router.post("/firmar-word", firmarWord);
router.post("/firma", uploadFirma.single("firma"), subirFirma);

router.post("/aprobar", firmarDocumento);

router.get("/firma", obtenerFirma);
router.get("/", obtenerDocumentos);

router.get("/:id", obtenerDocumentoPorId);
router.patch("/:id/estado", actualizarEstado);
router.delete("/:id", eliminarDocumento);

export default router;
