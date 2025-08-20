import { Model } from "objection";

class Documento extends Model {
  static get tableName() {
    return "documentos";
  }

  static get relationMappings() {
    const Usuario = require("./Usuario.js");
    const Estado = require("./Estado.js");

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
