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

  // Crear tabla estados
  const existsEstados = await knex.schema.hasTable("estados");
  if (!existsEstados) {
    await knex.schema.createTable("estados", (table) => {
      table.increments("id").primary();
      table.string("nombre_estado", 50).notNullable();
    });

    // Insertar estado inicial
    await knex("estados").insert([{ nombre_estado: "pendiente" }]);
  }

  // Crear tabla documentos
  const existsDocs = await knex.schema.hasTable("documentos");
  if (!existsDocs) {
    await knex.schema.createTable("documentos", (table) => {
      table.increments("id").primary();
      table.string("correo", 50);
      table.string("nombre", 50);
      table.string("numero_doc", 50).unique();
      table.string("archivo1", 255);
      table.string("archivo2", 255);
      table
        .integer("estado_id")
        .unsigned()
        .references("id")
        .inTable("estados")
        .onDelete("SET NULL")
        .onUpdate("CASCADE")
        .defaultTo(1); // estado pendiente
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
  await knex.schema.dropTableIfExists("estados");
  await knex.schema.dropTableIfExists("admin");
}
