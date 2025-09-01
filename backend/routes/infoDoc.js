import express from "express";
import db from "../db.js"; // o tu conexión a BD

const router = express.Router();

// Obtener info del documento (incluido correo del usuario)
router.get("/documento/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const documento = await db("documentos")
      .join("usuario", "documentos.usuario_id", "usuario.id")
      .select("documentos.id", "documentos.nombre", "usuario.correo")
      .where("documentos.id", id)
      .first();

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json(documento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error consultando documento" });
  }
});

export default router;
