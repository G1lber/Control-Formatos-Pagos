/**
 * @param { import("knex").Knex } knex
 */

export function up(knex) {
  return knex.schema.alterTable("documentos", (table) => {
    table
      .integer("datosgf_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("datosGF")
      .onDelete("SET NULL")
      .index();
  });
}

export function down(knex) {
  return knex.schema.alterTable("documentos", (table) => {
    table.dropForeign("datosgf_id");
    table.dropColumn("datosgf_id");
  });
}
