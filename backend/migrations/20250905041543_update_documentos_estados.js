// migrations/20250904_add_estados_gf_gc_to_documentos.js

export async function up(knex) {
  await knex.schema.alterTable("documentos", (table) => {
    table
      .integer("estadogf_id")
      .unsigned()
      .references("id")
      .inTable("estados")
      .onDelete("SET NULL");

    table
      .integer("estadogc_id")
      .unsigned()
      .references("id")
      .inTable("estados")
      .onDelete("SET NULL");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("documentos", (table) => {
    table.dropColumn("estadogf_id");
    table.dropColumn("estadogc_id");
  });
}