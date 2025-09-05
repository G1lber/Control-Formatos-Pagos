import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar la conexión al inicializar
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error configurando el transporter:', error);
  } else {
    console.log('✅ Servidor de correo configurado correctamente');
  }
});

export const sendMail = async (to, subject, text, attachments = []) =>{
  try {
    const mailOptions = {
      from: `"Control de Pagos Sena" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado con éxito:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw error; // Es importante lanzar el error para manejarlo en el router
  }
};

export default transporter;