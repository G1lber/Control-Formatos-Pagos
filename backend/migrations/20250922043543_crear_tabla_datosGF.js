/**
 * @param { import("knex").Knex } knex
 */

export function up(knex) {
  return knex.schema.createTable("datosGF", (table) => {
    table.increments("id").primary();
    table.string("nombre_excel", 255).notNullable();
    table.string("contrato_SECOP", 100).notNullable();
    table.string("valor_obligacion", 255).notNullable();
    table.string("compromiso_SIIF", 100).notNullable();
    table.string("base_ica", 255).notNullable();
    table.string("ICA", 255).notNullable();
    table.string("base_retefuente", 255).notNullable();
    table.string("retefuente", 255).notNullable();
    table.string("embargo", 255).defaultTo(null);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("datosGF");
}
