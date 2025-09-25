// index.js (CommonJS)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Model } = require("objection");
const userRoutes = require("./routes/usuarios.js");
const loginRoutes = require("./routes/login.js");
const documentosRoutes = require("./routes/documentos.js");
const authRoutes = require("./routes/auth.js");
const knex = require("./config/db.js");
const path = require("path");
const rechazoRoutes = require("./routes/rechazo.js");
const fechasRoutes = require("./routes/fechas.js");
const recordatorioRoutes = require("./routes/recordatorio.js");

dotenv.config();
const app = express();

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

// nueva ruta para olvidé contraseña
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
