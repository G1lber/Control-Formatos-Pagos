import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
import userRoutes from "./routes/users.js";
app.use("/api/users", userRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log(`🚀 Backend corriendo en puerto ${process.env.PORT}`);
});
