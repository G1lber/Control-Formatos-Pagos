/**
 * @param { import("knex").Knex } knex
 */

export async function up(knex) {
  await knex.schema.createTable("tipos_documento", (table) => {
    table.increments("id").primary();
    table.string("nombre", 50).notNullable();          // Ej: Cédula de Ciudadanía
  });

  // Insertar valores por defecto
  await knex("tipos_documento").insert([
    { nombre: "CC" },
    { nombre: "TI" },
    { nombre: "CE" },
    { nombre: "PAS" },
  ]);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("tipos_documento");
}
