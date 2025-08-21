import { Model } from "objection";
import Documento from "./Documentos.js";

class Estado extends Model {
  static get tableName() {
    return "estados";
  }

  static get relationMappings() {

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
