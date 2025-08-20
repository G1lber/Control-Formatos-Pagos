import { Model } from "objection";

class Estado extends Model {
  static get tableName() {
    return "estados";
  }

  static get relationMappings() {
    const Documento = require("./Documento.js");

    return {
      documentos: {
        relation: Model.HasManyRelation,
        modelClass: Documento,
        join: {
          from: "estados.id",
          to: "documentos.estado_id",
        },
      },
    };
  }
}

export default Estado;
