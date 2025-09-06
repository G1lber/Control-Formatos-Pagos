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
  const { documentoId, mensaje, tipoArchivo } = req.body;

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
 
    let archivoSeleccionado;
    if (tipoArchivo === "archivo1") archivoSeleccionado = documento.archivo1;
    else if (tipoArchivo === "archivo2") archivoSeleccionado = documento.archivo2;
    else archivoSeleccionado = "archivo desconocido";

    const emailHtml = `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header extremadamente delgado -->
              <tr>
                <td style="background: linear-gradient(90deg, #43B02A 0%, #2D6B00 100%); padding: 10px 18px; line-height: 1;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="vertical-align: middle; padding: 0;">
                        <span style="color:#ffffff; font-weight:bold; font-size:14px; display:block; line-height: 1; margin: 0;">SENA</span>
                      </td>
                      <td style="text-align:right; color:#ffffff; font-weight:bold; font-size:10px; vertical-align: middle; padding: 0; line-height: 1; margin: 0;">
                        Control de Pagos
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:20px; color:#333333; font-size:14px; line-height:1.4;">
                  <p style="margin:0 0 12px 0;">Hola <strong>${documento.nombre || 'Usuario'}</strong>,</p>

                  <p style="margin:0 0 12px 0;">
                    El documento <strong>"${archivoSeleccionado}"</strong> ha sido <span style="color:#cc0000; font-weight:600;">rechazado</span>.
                  </p>

                  <p style="margin:0 0 12px 0;">📋 <strong>Motivo:</strong> <span style="color:#2E8C00;">${mensaje}</span></p>

                  <p style="margin:0 0 16px 0;">Por favor, realiza las correcciones necesarias y vuelve a subir el documento a la plataforma.</p>

                  <!-- Botón -->
                  <p style="margin:0 0 18px 0;">
                    <a href="${BASE_URL}/mis-documentos" style="display:inline-block; padding:10px 16px; background:#39A900; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:600;">
                      Volver a subir documento
                    </a>
                  </p>

                  <p style="margin:0;">Atentamente,<br><strong>Equipo Control de Pagos SENA</strong></p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f2f2f2; padding:12px; text-align:center; font-size:12px; color:#666;">
                  Este es un mensaje automático. Si tienes dudas, responde a este correo o contacta al equipo de Control de Pagos.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
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
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;