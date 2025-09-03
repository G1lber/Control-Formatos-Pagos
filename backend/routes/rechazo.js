import express from "express";
import { sendMail } from "../config/mailer.js";
import db from "../config/db.js"; 
import { fileURLToPath } from 'url';
import path from 'path';

const router = express.Router();

router.post("/", async (req, res) => {
  const { documentoId, mensaje, tipoArchivo} = req.body;

  console.log("📨 Datos recibidos:", { documentoId, mensaje, tipoArchivo});

  if (!documentoId || !mensaje || !tipoArchivo) {
    return res.status(400).json({ 
      error: "Faltan datos",
      detalles: { documentoId, mensaje, tipoArchivo}
    });
  }

  try {
    const documento = await db("documentos")
      .join("usuarios", "documentos.usuario", "usuarios.id")
      .select("usuarios.correo", "documentos.archivo1","documentos.archivo2","usuarios.nombre")
      .where("documentos.id", documentoId)
      .first();

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Elegir archivo según tipo
    let archivoSeleccionado;
    if (tipoArchivo === "archivo1") archivoSeleccionado = documento.archivo1;
    else if (tipoArchivo === "archivo2") archivoSeleccionado = documento.archivo2;
    else archivoSeleccionado = "archivo desconocido";


    console.log("📧 Enviando correo a:", documento.correo);

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Hola <strong>${documento.nombre || 'Usuario'}</strong>,</p>
      <p>El documento <strong>"${archivoSeleccionado}"</strong> ha sido <span style="color:red;">rechazado</span>.</p>
      <p>📋 <strong>Motivo:</strong> <span style="color:#6a0dad;">${mensaje}</span></p>
      <p>Por favor, corrige y vuelve a subir el documento.</p>
      <p>Atentamente,<br><strong>Equipo Control de Pagos Sena</strong></p>
    </div>`;

    await sendMail(
      documento.correo,
      "Notificación: Documento Rechazado - Control de Pagos Sena",
      emailHtml
    );

    // console.log("✅ Correo enviado exitosamente");
    return res.status(200).json({ success: true });

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

