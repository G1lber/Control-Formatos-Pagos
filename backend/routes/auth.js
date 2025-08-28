import express from "express";
import bcrypt from "bcrypt";
import Login from "../models/Login.js";
import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import ResetCode from "../models/ResetCode.js"; // si usas tabla
import nodemailer from "nodemailer";

const router = express.Router();

//  Config de correo
const transporter = nodemailer.createTransport({
  service: "gmail", // o tu SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Enviar código
router.post("/forgot-password", async (req, res) => {
  const { numero_doc } = req.body; // <--- en vez de correo

  try {
    const usuario = await Usuario.query()
      .joinRelated("[login, rol]")
      .where("login.numero_doc", numero_doc)  // <--- corregido
      .andWhere("rol.nombre", "admin")
      .first();

    if (!usuario) {
      return res.status(404).json({ error: "Documento no válido o no es admin" });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await ResetCode.query().insert({
      numero_doc, // <--- cambiar columna
      codigo,
      expiracion: new Date(Date.now() + 10 * 60000),
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: usuario.login.correo ?? "tu@correo.com", // si no tienes correo, toca ver cómo se envía
      subject: "Código de recuperación",
      text: `Tu código de verificación es: ${codigo}`,
    });

    return res.json({ mensaje: "Código enviado" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});
// Verificar código
router.post("/verify-code", async (req, res) => {
  const { correo, codigo } = req.body;

  try {
    const registro = await ResetCode.query()
      .where("correo", correo)
      .andWhere("codigo", codigo)
      .andWhere("expiracion", ">", new Date())
      .first();

    if (!registro) {
      return res.status(400).json({ error: "Código inválido o expirado" });
    }

    return res.json({ mensaje: "Código válido" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// Cambiar contraseña
router.post("/reset-password", async (req, res) => {
  const { correo, codigo, nuevaPassword } = req.body;

  try {
    const registro = await ResetCode.query()
      .where("correo", correo)
      .andWhere("codigo", codigo)
      .andWhere("expiracion", ">", new Date())
      .first();

    if (!registro) {
      return res.status(400).json({ error: "Código inválido o expirado" });
    }

    const hash = await bcrypt.hash(nuevaPassword, 10);

    await Login.query()
      .patch({ contrasena: hash })
      .where("correo", correo);

    // Eliminar código
    await ResetCode.query().deleteById(registro.id);

    return res.json({ mensaje: "Contraseña cambiada con éxito" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
