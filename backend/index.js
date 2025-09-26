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

// 🔥 Habilitar CORS para producción y desarrollo
const allowedOrigins = [
  "http://localhost:5173",
  "https://gilberformatosgfgc.adsombrosos.com",
  "https://adsombrosos.com"
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir peticiones sin origin (curl, servidores internos)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("No permitido por CORS"));
    },
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

// --- Montar rutas bajo /api y /api.formatosgfgc para compatibilidad cPanel ---
const mountRoutes = (prefix) => {
  app.use(`${prefix}/fechas`, fechasRoutes);
  app.use(`${prefix}/usuarios`, userRoutes);
  app.use(`${prefix}/login`, loginRoutes);
  app.use(`${prefix}/documentos`, documentosRoutes);
  app.use(`${prefix}/rechazo`, rechazoRoutes);
  app.use(`${prefix}/recordatorio`, recordatorioRoutes);
  app.use(`${prefix}/auth`, authRoutes);
};

mountRoutes("/api");
mountRoutes("/api.formatosgfgc");

// Ruta raíz y alias para verificación (sirven HTML para cPanel)
app.get(["/", "/api.formatosgfgc"], (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send("<h1>Servidor Node.js funcionando correctamente</h1>");
});

app.use("/api/tipos_documento", tiposDocumentoRoutes);

// nueva ruta para olvidé contraseña
app.use("/auth", authRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});