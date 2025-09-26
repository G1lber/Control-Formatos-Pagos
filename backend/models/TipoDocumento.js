const { Model } = require("objection");

class TipoDocumento extends Model {
  static get tableName() {
    return "tipos_documento";
  }
}

module.exports = TipoDocumento;