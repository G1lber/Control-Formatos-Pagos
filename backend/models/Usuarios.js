import { Model } from "objection";

class Usuario extends Model {
  static get tableName() {
    return "usuarios";
  }

  static get relationMappings() {
    const Documento = require("./Documento.js");
    const Login = require("./Login.js");
    const Rol = require("./Rol.js");

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
    };
  }
}

export default Usuario;
