import { Model } from "objection";

class Usuario extends Model {
  static get tableName() {
    return "usuarios";
  }

  static get relationMappings() {
    const Documento = require("./Documento.js");
    const Login = require("./Login.js");

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
    };
  }
}

export default Usuario;
