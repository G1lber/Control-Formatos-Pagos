export function up(knex) {
  return knex.schema.createTable("fechas_limite", (table) => {
    table.increments("id").primary();
    table.string("tipo", 10).notNullable();              // Ej: GF o GC
    table.dateTime("fecha_hora_limite").notNullable();   // Fecha + Hora en un solo campo
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("fechas_limite");
}
