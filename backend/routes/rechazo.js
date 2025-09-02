import express from "express";
import { sendMail } from "../config/mailer.js";
import db from "../config/db.js"; 

const router = express.Router();

router.post("/rechazo", async (req, res) => {
  const { documentoId, mensaje} = req.body;

  console.log("📨 Datos recibidos:", { documentoId, mensaje});

  if (!documentoId || !mensaje ) {
    return res.status(400).json({ 
      error: "Faltan datos",
      detalles: { documentoId, mensaje}
    });
  }

  try {
    const documento = await db("documentos")
      .join("usuarios", "documentos.usuario", "usuarios.id")
      .select("usuarios.correo", "documentos.archivo1","usuarios.nombre")
      .where("documentos.id", documentoId)
      .first();

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }


    console.log("📧 Enviando correo a:", documento.correo);

    const emailText = `
    Hola ${documento.nombre || 'Usuario'},

    El documento "${documento.archivo1}" que subiste al sistema de Control de Pagos Sena ha sido revisado y rechazado.

    📋 Motivo del rechazo:
    ${mensaje}

    Por favor, corrige los aspectos señalados y vuelve a subir el documento.

    Atentamente,
    Equipo de Control de Pagos Sena
    `.trim();

    await sendMail(
      documento.correo,
      "Notificación: Documento Rechazado - Control de Pagos Sena",
      emailText
    );

    console.log("✅ Correo enviado exitosamente");
    res.json({ success: true, msg: "Correo enviado correctamente ✅", destinatario: documento.correo });

  } catch (error) {
    console.error("❌ Error completo:", error);
    res.status(500).json({
      error: "Error enviando el correo ❌",
      detalle: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

