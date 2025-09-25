const { Model } = require("objection");
const Usuario = require("./Usuario.js");

class TipoDocumento extends Model {
  static get tableName() {
    return "tipos_documento";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    return {
      usuarios: {
        relation: Model.HasManyRelation,
        modelClass: Usuario,
        join: {
          from: "tipos_documento.id",
          to: "usuarios.tipo_documento_id",
        },
      },
    };
  }
}

module.exports = TipoDocumento;