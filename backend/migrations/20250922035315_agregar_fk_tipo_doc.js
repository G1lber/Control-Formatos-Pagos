/**
 * @param { import("knex").Knex } knex
 */

export function up(knex) {
  return knex.schema.alterTable("usuarios", (table) => {
    table
      .integer("tipo_doc")
      .unsigned()
      .nullable(null) // ✅ permite valores NULL por defecto
      .references("id")
      .inTable("tipos_documento")
      .onDelete("SET NULL") // ✅ si se borra un tipo de doc, el campo pasa a NULL
      .index();
  });
}

export function down(knex) {
  return knex.schema.alterTable("usuarios", (table) => {
    table.dropForeign("tipo_doc");
    table.dropColumn("tipo_doc");
  });
}
