const FechaLimite = require("../models/FechaLimite.js");

// Obtener últimas fechas
const getFechas = async (req, res) => {
  try {
    const fechas = await FechaLimite.query().orderBy("id", "desc").limit(2);

    const result = {
      fechaGF: null,
      fechaGC: null,
    };

    fechas.forEach((f) => {
      if (f.tipo === "GF") result.fechaGF = f.fecha_hora_limite;
      if (f.tipo === "GC") result.fechaGC = f.fecha_hora_limite;
    });

    res.json(result);
  } catch (error) {
    console.error("❌ Error obteniendo fechas:", error);
    res.status(500).json({ error: "Error al obtener fechas" });
  }
};


// Convierte fecha a formato MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
function toMySQLDateTime(date) {
  if (!date) return null;
  let d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

const saveFechas = async (req, res) => {
  try {
    const { fechaGF, fechaGC } = req.body;

    const fechaGFMySQL = toMySQLDateTime(fechaGF);
    const fechaGCMySQL = toMySQLDateTime(fechaGC);

    let gf = await FechaLimite.query().findOne({ tipo: "GF" });
    if (gf) {
      gf = await FechaLimite.query().patchAndFetchById(gf.id, {
        fecha_hora_limite: fechaGFMySQL,
      });
    } else {
      gf = await FechaLimite.query().insert({
        tipo: "GF",
        fecha_hora_limite: fechaGFMySQL,
      });
    }

    let gc = await FechaLimite.query().findOne({ tipo: "GC" });
    if (gc) {
      gc = await FechaLimite.query().patchAndFetchById(gc.id, {
        fecha_hora_limite: fechaGCMySQL,
      });
    } else {
      gc = await FechaLimite.query().insert({
        tipo: "GC",
        fecha_hora_limite: fechaGCMySQL,
      });
    }

    res.json({ gf, gc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar fechas" });
  }
};

module.exports = { getFechas, saveFechas };