const { Model } = require("objection");
const Usuario = require("./Usuario.js");

class Login extends Model {
  static get tableName() {
    return "login";
  }

  static get relationMappings() {
    return {
      usuario_rel: {
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

module.exports = Login;