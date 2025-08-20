import express from "express";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuario
} from "../controllers/usuariosController.js";

const router = express.Router();

// Rutas de Usuarios
router.get("/", getUsuarios);          // Obtener todos
router.get("/:id",getUsuario);        // Obtener uno
router.post("/", createUsuario);       // Crear
router.put("/:id", updateUsuario);     // Actualizar
router.delete("/:id", deleteUsuario);  // Eliminar

export default router;
