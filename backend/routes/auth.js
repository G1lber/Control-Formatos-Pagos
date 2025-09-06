import express from "express";
import bcrypt from "bcrypt";
import Login from "../models/Login.js";
import Usuario from "../models/Usuario.js";
import ResetCode from "../models/ResetCode.js"; // si usas tabla
import nodemailer from "nodemailer";
import transporter from "../config/mailer.js";

const router = express.Router();

// Enviar código a correo
router.post("/forgot-password", async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ error: "El correo es obligatorio" });

  try {
    // buscar usuario por correo y que sea admin si lo necesitas
    const usuario = await Usuario.query()
      .withGraphFetched("[rol, login]")
      .where("correo", correo)
      .first();
    
    if (!usuario) return res.status(404).json({ error: "Correo no registrado" });
    if (usuario.rol && usuario.rol.nombre_rol !== "admin") {
    return res.status(403).json({ error: "Solo los admin pueden recuperar contraseña" });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // elimina códigos previos (opcional) y guarda uno nuevo (10 min)
    await ResetCode.query().delete().where("usuario_id", usuario.id);
    await ResetCode.query().insert({
      usuario_id: usuario.id,
      codigo,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });

    // envía correo
    await transporter.sendMail({
      from: `"Control de Pagos Sena" <${process.env.SMTP_USER}>`,
      to: usuario.correo,                      // <<<<<< AQUÍ se usa el correo de la tabla usuarios
      subject: "Código de recuperación",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <!-- HEADER -->
  <div style="background-color: #ffffff; padding: 16px; text-align: center;">
    <img src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png" alt="Logo SENA" style="width: 100px; margin-bottom: 8px;" />
    <h2 style="color: #39A900; margin: 0;">Control de Pagos SENA</h2>
  </div>

  <!-- CUERPO -->
  <div style="padding: 20px; color: #333;">
    <p>Hola <b>${usuario.nombre || "Usuario"}</b>,</p>
    <p>Has solicitado recuperar tu contraseña. Usa el siguiente código de verificación:</p>
    <div style="text-align: center; margin: 24px 0;">
      <span style="display: inline-block; font-size: 22px; font-weight: bold; color: #2E8C00; background: #f0fdf4; border: 2px dashed #39A900; padding: 12px 24px; border-radius: 6px;">
        ${codigo}
      </span>
    </div>
    <p style="color: #555;">⏰ Este código expira en <b>10 minutos</b>.</p>
    <p style="margin-top: 20px;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
  </div>

  <!-- FOOTER -->
  <div style="background-color: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #777;">
    © ${new Date().getFullYear()} SENA - Control de Pagos
  </div>
</div>
      `,
    });

    return res.json({ mensaje: "Código enviado al correo" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// Verificar código (correo → usuario_id)
router.post("/verify-code", async (req, res) => {
  const { correo, codigo } = req.body;
  if (!correo || !codigo) return res.status(400).json({ error: "Datos incompletos" });

  try {
    const usuario = await Usuario.query().where("correo", correo).first();
    if (!usuario) return res.status(404).json({ error: "Correo no registrado" });

    const registro = await ResetCode.query()
      .where("usuario_id", usuario.id)
      .andWhere("codigo", codigo)
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!registro) return res.status(400).json({ error: "Código inválido o expirado" });

    return res.json({ mensaje: "Código válido" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// Cambiar contraseña (correo + código)
router.post("/reset-password", async (req, res) => {
  const { correo, codigo, nuevaPassword } = req.body;
  if (!correo || !codigo || !nuevaPassword)
    return res.status(400).json({ error: "Datos incompletos" });

  try {
    const usuario = await Usuario.query().where("correo", correo).first();
    if (!usuario) return res.status(404).json({ error: "Correo no registrado" });

    const registro = await ResetCode.query()
      .where("usuario_id", usuario.id)
      .andWhere("codigo", codigo)
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!registro) return res.status(400).json({ error: "Código inválido o expirado" });

    const hash = await bcrypt.hash(nuevaPassword, 10);

    await Login.query()
      .patch({ password: hash })             // tu columna es "password"
      .where("usuario", usuario.id);         // FK a usuarios.id

    await ResetCode.query().deleteById(registro.id);

    return res.json({ mensaje: "Contraseña cambiada con éxito" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;