import { Model } from "objection";
import Documento from "./Documentos.js";
import Login from "./Login.js";
import Rol from "./Rol.js";
import TipoDocumento from "./TipoDocumento.js";

class Usuario extends Model {
  static get tableName() {
    return "usuarios";
  }

   static get columnNameMappers() {
    return {
      parse(obj) {
        // De BD → JS
        if (obj.tipo_doc !== undefined) {
          obj.tipo_documento_id = obj.tipo_doc;
          delete obj.tipo_doc;
        }
        return obj;
      },
      format(obj) {
        // De JS → BD
        if (obj.tipo_documento_id !== undefined) {
          obj.tipo_doc = obj.tipo_documento_id;
          delete obj.tipo_documento_id;
        }
        return obj;
      },
    };
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
          from: "usuarios.tipo_doc",
          to: "tipos_documento.id",
        },
      },
    };
  }
}

export default Usuario;
