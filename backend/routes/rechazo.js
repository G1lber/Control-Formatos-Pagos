import express from "express";
import { sendMail } from "../config/mailer.js";

const router = express.Router();

router.post("/rechazo", async (req, res) => {
  const { documentoId, mensaje } = req.body;

  if (!documentoId || !mensaje) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    // Buscar correo del contratista en la BD
    const documento = await db("documentos")
      .join("usuario", "documentos.usuario_id", "usuario.id")
      .select("usuario.correo", "documentos.nombre")
      .where("documentos.id", documentoId)
      .first();

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Enviar correo
    await sendMail(
      documento.correo,
      "Notificación: Documento rechazado",
      `El documento "${documento.nombre}" fue rechazado.\n\nMotivo: ${mensaje}`
    );

    res.json({ success: true, msg: "Correo enviado correctamente ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error enviando correo ❌" });
  }
});

export default router;
