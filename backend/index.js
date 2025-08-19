// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";

dotenv.config();
const app = express();

// 🔥 importante: habilitar cors solo para el front
app.use(cors({
  origin: "http://localhost:5173", // puerto de Vite
  credentials: true
}));
app.use(express.json());

// rutas
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
