// backend/routes/documentosRoutes.js
import express from "express";
import { subirDocumento, upload } from "../controllers/documentosController.js";

const router = express.Router();

// Middleware de subida con manejo de errores
router.post("/", (req, res, next) => {
  upload.single("archivo")(req, res, (err) => {
    if (err) {
      // 🚨 Capturamos el error del fileFilter o de Multer
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, subirDocumento);

export default router;
