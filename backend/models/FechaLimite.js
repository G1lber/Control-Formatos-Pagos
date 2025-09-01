import { Model } from "objection";

class FechaLimite extends Model {
  static get tableName() {
    return "fechas_limite";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["tipo", "fecha_hora_limite"],
      properties: {
        id: { type: "integer" },
        tipo: { type: "string", minLength: 1, maxLength: 10 }, // Ej: GF o GC
        fecha_hora_limite: { type: "string", format: "date-time" } // ISO 8601
      },
    };
  }
}

export default FechaLimite;
