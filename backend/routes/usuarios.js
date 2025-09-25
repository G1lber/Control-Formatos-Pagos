const express = require("express");
const {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuario
} = require("../controllers/usuariosController.js");

const router = express.Router();

// Rutas de Usuarios
router.get("/", getUsuarios);          // Obtener todos
router.get("/:id", getUsuario);        // Obtener uno
router.post("/", createUsuario);       // Crear
router.put("/:id", updateUsuario);     // Actualizar
router.delete("/:id", deleteUsuario);  // Eliminar

module.exports = router;
