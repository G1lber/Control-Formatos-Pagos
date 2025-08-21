import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Model } from "objection";
import userRoutes from "./routes/usuarios.js";
import documentosRoutes from "./routes/documentos.js"
import knex from "./config/db.js";

dotenv.config();
const app = express();

// 🔥 Habilitar cors solo para el front
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// 🔹 Enlazar Objection con Knex
Model.knex(knex);

// rutas
app.use("/api/usuarios", userRoutes);
app.use("/api/documentos", documentosRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
