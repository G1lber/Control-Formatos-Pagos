import { Model } from "objection";

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
        modelClass: new URL("./Usuario.js", import.meta.url).pathname,
        join: {
          from: "tipos_documento.id",
          to: "usuarios.tipo_documento_id",
        },
      },
    };
  }
}

export default TipoDocumento;
