import express from "express";
import { sendMail } from "../config/mailer.js";
import db from "../config/db.js"; 
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL pública para las imágenes
const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

router.post("/", async (req, res) => {
  const { documentoId, tipoDocumento } = req.body;

  if (!documentoId || !tipoDocumento) {
    return res.status(400).json({
      error: "Faltan datos",
      detalles: { documentoId, tipoDocumento }
    });
  }

  try {
    const documento = await db("documentos")
      .join("usuarios", "documentos.usuario", "usuarios.id")
      .select(
        "usuarios.correo",
        "documentos.archivo1",
        "documentos.archivo2",
        "usuarios.nombre",
        "documentos.id as documentoId"
      )
      .where("documentos.id", documentoId)
      .first();

    if (!documento) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Definición de colores corporativos en el script
    const colorPrincipal = "#39A900"; // Verde
    const colorTexto = "#002b46"; // Azul oscuro
    const colorBlanco = "#ffffff";
    const colorRojo = "#e31837"; // Un rojo llamativo para el 'pendiente'

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #dcdcdc; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: ${colorBlanco}; padding: 16px; text-align: center; border-bottom: 3px solid ${colorPrincipal};">
          <img src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png" alt="Logo SENA" style="width: 100px; margin-bottom: 8px;" />
          <h2 style="color: ${colorPrincipal}; margin: 0; font-weight: bold;">Control de Pagos SENA</h2>
        </div>

        <div style="padding: 20px; color: ${colorTexto};"> 
          <p style="font-weight: bold; margin-bottom: 8px; font-size: 12px;">
            <span style="color: ${colorRojo};">Recordatorio: Documentos Pendientes ⚠️⚠️⚠️ </span>
          </p>
          <p>
            <span style="font-weight: bold; color: ${colorPrincipal};">Estimado(a): ${documento.nombre || "usuario"}</span>
          </p>
          <p>
            Le recordamos que la documentación correspondiente a su proceso de control de pagos <strong><span style="color: ${colorRojo};">${tipoDocumento === "GF" ? "GF" : "GC"}</span></strong>, aún se encuentra pendiente.
          </p>

          <p>Agradecemos su colaboración de cargar los documentos en la plataforma, a la mayor brevedad posible. Esto nos permitirá evitar demoras y asegurar la correcta gestión de los archivos requeridos en el área administrativa.</p>

          <p style="margin-top: 20px;">
            <span style="font-weight: bold; color: ${colorPrincipal};">Atentamente</span>
            <br>
            <strong><span style="font-weight: bold; color: ${colorPrincipal};">Equipo Control de Pagos SENA</span></strong>
          </p>
        </div>

        <div style="background-color: #f4f7fa; padding: 12px; text-align: center; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} SENA - Control de Pagos<br>
          Este es un mensaje automático. Si tienes dudas, responde a este correo o contacta al equipo de Control de Pagos.
        </div>
      </div>
    `;

    await sendMail(
      documento.correo,
      "Recordatorio: Documento Pendiente - Control de Pagos SENA",
      emailHtml
    );

    return res.status(200).json({ 
      success: true,
      message: "Correo de recordatorio enviado correctamente"
    });

  } catch (error) {
    console.error("❌ Error completo:", error);
    res.status(500).json({
      error: "Error enviando el correo ❌",
      detalle: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

export default router;