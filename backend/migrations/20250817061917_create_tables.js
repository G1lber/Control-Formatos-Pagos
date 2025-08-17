/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Crear tabla admin
  const existsAdmin = await knex.schema.hasTable("admin");
  if (!existsAdmin) {
    await knex.schema.createTable("admin", (table) => {
      table.increments("id").primary();
      table.string("usuario", 50).notNullable().defaultTo("");
      table.string("password", 100).notNullable();
    });
  }

  // Crear tabla documentos
  const existsDocs = await knex.schema.hasTable("documentos");
  if (!existsDocs) {
    await knex.schema.createTable("documentos", (table) => {
      table.increments("id").primary();
      table.string("correo", 50);
      table.string("nombre", 50);
      table.string("numero_doc", 50).unique();
      table.string("archivo1", 50);
      table.string("archivo2", 50);
      table.dateTime("fecha").defaultTo(knex.fn.now());
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("documentos");
  await knex.schema.dropTableIfExists("admin");
}