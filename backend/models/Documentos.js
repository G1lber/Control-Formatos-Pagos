import { Model } from "objection";
import Usuario from "./Usuario.js";
import Estado from "./Estado.js";

class Documento extends Model {
  static get tableName() {
    return "documentos";
  }

  static get relationMappings() {

    return {
      usuario: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: "documentos.usuario",
          to: "usuarios.id",
        },
      },
      estado: {
        relation: Model.BelongsToOneRelation,
        modelClass: Estado,
        join: {
          from: "documentos.estado_id",
          to: "estados.id",
        },
      },
    };
  }
}

export default Documento;
