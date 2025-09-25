import { Model } from "objection";
import Usuario from "./Usuario.js";
import Estado from "./Estado.js";
import DatosGF from "./DatosGF.js";

class Documento extends Model {
  static get tableName() {
    return "documentos";
  }

  static get relationMappings() {
    return {
      usuarioRef: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: "documentos.usuario",
          to: "usuarios.id",
        },
      },
      estadoGF: {
        relation: Model.BelongsToOneRelation,
        modelClass: Estado,
        join: {
          from: "documentos.estadogf_id",
          to: "estados.id",
        },
      },
      estadoGC: {
        relation: Model.BelongsToOneRelation,
        modelClass: Estado,
        join: {
          from: "documentos.estadogc_id",
          to: "estados.id",
        },
      },
      datosGF: {
        relation: Model.BelongsToOneRelation,
        modelClass: DatosGF,
        join: {
          from: "documentos.datosgf_id",
          to: "datosGF.id",
        },
      },
    };
  }
}

export default Documento;