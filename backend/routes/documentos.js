import express from "express";
import { subirDocumento, upload } from "../controllers/documentosController.js";

const router = express.Router();

// Subida de documentos
router.post(
  "/",
  upload.single("archivo"), // el campo de tu form-data
  subirDocumento
);

export default router;
