import { Model } from "objection";

class Login extends Model {
  static get tableName() {
    return "login";
  }

  static get relationMappings() {
    const Usuario = require("./Usuario.js");

    return {
      usuario: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: "login.usuario",
          to: "usuarios.id",
        },
      },
    };
  }
}

export default Login;
