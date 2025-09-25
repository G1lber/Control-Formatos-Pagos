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

// Guardar/Actualizar
const saveFechas = async (req, res) => {
  try {
    const { fechaGF, fechaGC } = req.body;

    let gf = await FechaLimite.query().findOne({ tipo: "GF" });
    if (gf) {
      gf = await FechaLimite.query().patchAndFetchById(gf.id, {
        fecha_hora_limite: fechaGF,
      });
    } else {
      gf = await FechaLimite.query().insert({
        tipo: "GF",
        fecha_hora_limite: fechaGF,
      });
    }

    let gc = await FechaLimite.query().findOne({ tipo: "GC" });
    if (gc) {
      gc = await FechaLimite.query().patchAndFetchById(gc.id, {
        fecha_hora_limite: fechaGC,
      });
    } else {
      gc = await FechaLimite.query().insert({
        tipo: "GC",
        fecha_hora_limite: fechaGC,
      });
    }

    res.json({ gf, gc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar fechas" });
  }
};

module.exports = { getFechas, saveFechas };