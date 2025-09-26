const TipoDocumento = require("../models/TipoDocumento.js");

const getTiposDocumento = async (req, res) => {
  try {
    const tipos = await TipoDocumento.query().orderBy("nombre", "asc");
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tipos de documento" });
  }
};

module.exports = {
  getTiposDocumento,
};
