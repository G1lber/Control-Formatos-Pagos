import express from "express";
import { getTiposDocumento } from "../controllers/tipoDocumentoController.js";

const router = express.Router();
router.get("/", getTiposDocumento);
export default router;

