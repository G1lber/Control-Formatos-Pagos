// index.js (CommonJS)
const express = require("express");
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
const tiposDocumentoRoutes = require("./routes/tipoDocumento.js");

dotenv.config();
const app = express();

// ✅ Middleware CORS universal
const allowedOrigins = [
  "http://localhost:5173",
  "https://gilberformatosgfgc.adsombrosos.com",
  "https://adsombrosos.com",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Si no envía origin (por ejemplo desde cURL o requests internos), permitir por defecto
  const finalOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[1];

  res.setHeader("Access-Control-Allow-Origin", finalOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Asegura que JSON se procese antes de rutas
app.use(express.json());

// ✅ Rutas públicas de archivos
const uploadsPath = "/home2/adso2971602/gilber_backend/documentos-formatos";
app.use("/uploads", express.static(path.join(__dirname, "documentos-formatos")));
app.use("/api.formatosgfgc/uploads", express.static(uploadsPath));
app.use("/documentos-formatos", express.static(uploadsPath));
app.use("/api.formatosgfgc/documentos-formatos", express.static(uploadsPath));

// ✅ Conexión Objection + Knex
Model.knex(knex);

// ✅ Montar rutas
const mountRoutes = (prefix) => {
  app.use(`${prefix}/fechas`, fechasRoutes);
  app.use(`${prefix}/usuarios`, userRoutes);
  app.use(`${prefix}/login`, loginRoutes);
  app.use(`${prefix}/documentos`, documentosRoutes);
  app.use(`${prefix}/rechazo`, rechazoRoutes);
  app.use(`${prefix}/recordatorio`, recordatorioRoutes);
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/tipos_documento`, tiposDocumentoRoutes);
};

mountRoutes("/api");
mountRoutes("/api.formatosgfgc");

// ✅ Ruta base
app.get(["/", "/api.formatosgfgc"], (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send("<h1>Servidor Node.js funcionando correctamente</h1>");
});

// 🛡️ Middleware global para errores no capturados (incluye CORS en errores 500)
app.use((err, req, res, next) => {
  console.error("🔥 Error no capturado:", err);
  res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
