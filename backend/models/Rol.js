import { Model } from "objection";
import Usuario from "./Usuario.js";

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

export default Rol;
