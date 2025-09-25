// ...existing code...
const { Model } = require("objection");

class DatosGF extends Model {
  static get tableName() {
    return "datosGF";
  }
}

module.exports = DatosGF;
// ...existing code...