import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Control de Pagos Sena" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log("Correo enviado con éxito");
  } catch (error) {
    console.error("Error enviando correo :", error);
  }
};

export default transporter;
