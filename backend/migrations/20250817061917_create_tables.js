export async function up(knex) {
  await knex.schema.createTable("usuarios", (table) => {
    table.increments("id").primary();
    table.string("nombre", 50);
    table.integer("numero_doc").unique();
    table.string("correo", 50);
  });

  await knex.schema.createTable("estados", (table) => {
    table.increments("id").primary();
    table.string("nombre_estado", 50).notNullable();
  });

  await knex.schema.createTable("documentos", (table) => {
    table.increments("id").primary();
    table.integer("usuario").notNullable().unsigned();
    table.string("archivo1", 255);
    table.string("archivo2", 255);
    table
      .integer("estado_id")
      .unsigned()
      .defaultTo(1)
      .references("id")
      .inTable("estados")
      .onUpdate("CASCADE")
      .onDelete("SET NULL");
    table.timestamp("fecha").defaultTo(knex.fn.now());

    table
      .foreign("usuario")
      .references("id")
      .inTable("usuarios")
      .onUpdate("NO ACTION")
      .onDelete("NO ACTION");
  });

  await knex.schema.createTable("login", (table) => {
    table.increments("id").primary();
    table.integer("usuario").notNullable().unsigned();
    table.string("password", 100).notNullable();

    table
      .foreign("usuario")
      .references("id")
      .inTable("usuarios")
      .onUpdate("NO ACTION")
      .onDelete("NO ACTION");
  });

  // Insertar estados iniciales
  await knex("estados").insert([
    { nombre_estado: "pendiente" },
    { nombre_estado: "revisado" },
    { nombre_estado: "sin documento" },
  ]);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("login");
  await knex.schema.dropTableIfExists("documentos");
  await knex.schema.dropTableIfExists("estados");
  await knex.schema.dropTableIfExists("usuarios");
}
