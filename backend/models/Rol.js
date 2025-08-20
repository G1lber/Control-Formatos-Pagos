import { Model } from "objection";

class Rol extends Model {
  static get tableName() {
    return "roles";
  }

  static get relationMappings() {
    const Usuario = require("./Usuario.js");

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

export default Rol;
