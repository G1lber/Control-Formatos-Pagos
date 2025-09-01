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
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: usuario.correo,                      // <<<<<< AQUÍ se usa el correo de la tabla usuarios
      subject: "Código de recuperación",
      html: `
        <p>Hola ${usuario.nombre || ""},</p>
        <p>Tu código de verificación es: <b style="font-size:18px">${codigo}</b></p>
        <p>Expira en 10 minutos.</p>
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