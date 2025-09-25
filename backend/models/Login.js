const { Model } = require("objection");

class Login extends Model {
  static get tableName() {
    return "login";
  }

  static get relationMappings() {
    return {
      usuario_rel: {
        relation: Model.BelongsToOneRelation,
        modelClass: () => require("./Usuario"),
        join: {
          from: "login.usuario_id",
          to: "usuarios.id" // ← aquí pon el nombre real de tu tabla
        }
      }
    };
  }
}

module.exports = Login;