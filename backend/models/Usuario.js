import { Model } from "objection";
import Documento from "./Documentos.js";
import Login from "./Login.js";
import Rol from "./Rol.js";
import TipoDocumento from "./TipoDocumento.js";

class Usuario extends Model {
  static get tableName() {
    return "usuarios";
  }

  static get relationMappings() {
    return {
      documentos: {
        relation: Model.HasManyRelation,
        modelClass: Documento,
        join: {
          from: "usuarios.id",
          to: "documentos.usuario",
        },
      },
      login: {
        relation: Model.HasOneRelation,
        modelClass: Login,
        join: {
          from: "usuarios.id",
          to: "login.usuario",
        },
      },
      rol: {
        relation: Model.BelongsToOneRelation,
        modelClass: Rol,
        join: {
          from: "usuarios.rol_id",
          to: "roles.id",
        },
      },
      tipoDocumento: {
        relation: Model.BelongsToOneRelation,
        modelClass: TipoDocumento,
        join: {
          from: "usuarios.tipo_documento_id",
          to: "tipos_documento.id",
        },
      },
    };
  }
}

export default Usuario;
