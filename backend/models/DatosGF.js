// ...existing code...
const { Model } = require("objection");

class DatosGF extends Model {
  static get tableName() {
    return "datosgf";
  }
}

module.exports = DatosGF;
// ...existing code...