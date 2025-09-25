/**
 * @param { import("knex").Knex } knex
 */

export function up(knex) {
  return knex.schema.createTable("datosGF", (table) => {
    table.increments("id").primary();
    table.string("numero_planilla", 255).nullable();
    table.string("contrato_SECOP", 100).nullable();
    table.string("valor_obligacion", 255).nullable();
    table.string("compromiso_SIIF", 100).nullable();
    table.string("base_ica", 255).nullable();
    table.string("ICA", 255).nullable();
    table.string("base_retefuente", 255).nullable();
    table.string("retefuente", 255).nullable();
    table.string("embargo", 255).defaultTo(null);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("datosGF");
}
