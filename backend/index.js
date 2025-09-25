import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Model } from "objection";
import userRoutes from "./routes/usuarios.js";
import loginRoutes from "./routes/login.js";
import documentosRoutes from "./routes/documentos.js"
import authRoutes from "./routes/auth.js";
import knex from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import rechazoRoutes from "./routes/rechazo.js";
import fechasRoutes from "./routes/fechas.js";
import recordatorioRoutes from "./routes/recordatorio.js";
import tiposDocumentoRoutes from "./routes/tipoDocumento.js";

dotenv.config();
const app = express();

// Necesario para __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Habilitar cors solo para el front
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// 🔹 Enlazar Objection con Knex
Model.knex(knex);

// ✅ Servir estáticos (documentos subidos)
app.use(
  "/api/uploads",
  express.static(path.join(__dirname, "documentos-formatos"))
);

app.use(
  "/documentos-formatos",
  express.static(path.join(__dirname, "documentos-formatos"))
);


// rutas API
app.use("/api/fechas", fechasRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/documentos", documentosRoutes);
app.use("/api/rechazo", rechazoRoutes);
app.use("/api/recordatorio", recordatorioRoutes); 

app.use("/api/tipos_documento", tiposDocumentoRoutes);

// nueva ruta para olvidé contraseña
app.use("/auth", authRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});