const express = require("express");
const { sendMail } = require("../config/mailer.js");
const db = require("../config/db.js");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

// Base URL pública para las imágenes
const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

router.post("/", async (req, res) => {
  const { documentoId, mensaje, tipoArchivo } = req.body;

  if (!documentoId || !mensaje || !tipoArchivo) {
    return res.status(400).json({
      error: "Faltan datos",
      detalles: { documentoId, mensaje, tipoArchivo }
    });
  }

  try {
    const documento = await db("documentos")
      .join("usuarios", "documentos.usuario", "usuarios.id")
      .select(
        "usuarios.correo",
        "documentos.archivo1",
        "documentos.archivo2",
        "usuarios.nombre"
      )
      .where("documentos.id", documentoId)
      .first();

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    let archivoSeleccionado;
    if (tipoArchivo === "archivo1") {
      archivoSeleccionado = documento.archivo1;

      // 🔹 Actualizar estado GF → 1 (rechazado)
      await db("documentos")
        .where("id", documentoId)
        .update({ estadogf_id: 1 });

    } else if (tipoArchivo === "archivo2") {
      archivoSeleccionado = documento.archivo2;

      // 🔹 Actualizar estado GC → 1 (rechazado)
      await db("documentos")
        .where("id", documentoId)
        .update({ estadogc_id: 1 });

    } else {
      archivoSeleccionado = "archivo desconocido";
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- HEADER -->
        <div style="background-color: #ffffff; padding: 16px; text-align: center;">
          <img src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png" alt="Logo SENA" style="width: 100px; margin-bottom: 8px;" />
          <h2 style="color: #39A900; margin: 0;">Control de Pagos SENA</h2>
        </div>

        <!-- CUERPO -->
        <div style="padding: 20px; color: #333;">
          <p>Hola <b>${documento.nombre || "Usuario"}</b>,</p>

          <p>
            El documento <strong>"${archivoSeleccionado}"</strong> ha sido 
            <span style="color:#cc0000; font-weight:600;">rechazado</span>.
          </p>

          <p>📋 <strong>Motivo:</strong> <span style="color:#2E8C00;">${mensaje}</span></p>

          <p>Por favor, realiza las correcciones necesarias y vuelve a subir el documento a la plataforma.</p>

          <p style="margin-top: 20px;">Atentamente,<br><strong>Equipo Control de Pagos SENA</strong></p>
        </div>

        <!-- FOOTER -->
        <div style="background-color: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} SENA - Control de Pagos<br>
          Este es un mensaje automático. Si tienes dudas, responde a este correo o contacta al equipo de Control de Pagos.
        </div>
      </div>
    `;

    await sendMail(
      documento.correo,
      "Notificación: Documento Rechazado - Control de Pagos SENA",
      emailHtml
    );

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ Error completo:", error);
    res.status(500).json({
      error: "Error enviando el correo ❌",
      detalle: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;