import TipoDocumento from "../models/TipoDocumento.js";

export const getTiposDocumento = async (req, res) => {
  try {
    const tipos = await TipoDocumento.query().orderBy("nombre", "asc");
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
