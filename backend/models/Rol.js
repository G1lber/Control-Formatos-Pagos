const { Model } = require("objection");
const Usuario = require("./Usuario.js");

class Rol extends Model {
  static get tableName() {
    return "roles";
  }

  static get relationMappings() {
    return {
      usuarios: {
        relation: Model.HasManyRelation,
        modelClass: Usuario,
        join: {
          from: "roles.id",
          to: "usuarios.rol_id",
        },
      },
    };
  }
}

module.exports = Rol;

