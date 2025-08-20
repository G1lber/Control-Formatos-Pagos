export async function up(knex) {
  // Tabla de roles
  await knex.schema.createTable("roles", (table) => {
    table.increments("id").primary();
    table.string("nombre_rol", 50).notNullable();
  });

  // Tabla de usuarios
  await knex.schema.createTable("usuarios", (table) => {
    table.increments("id").primary();
    table.string("nombre", 50);
    table.integer("numero_doc").unique();
    table.string("correo", 50);
    table
      .integer("rol_id")
      .unsigned()
      .references("id")
      .inTable("roles")
      .onUpdate("CASCADE")
      .onDelete("SET NULL");
  });

  // Tabla de estados
  await knex.schema.createTable("estados", (table) => {
    table.increments("id").primary();
    table.string("nombre_estado", 50).notNullable();
  });

  // Tabla de documentos
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

  // Tabla de login
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

  // Insertar roles iniciales
  await knex("roles").insert([
    { nombre_rol: "admin" },
    { nombre_rol: "usuario" },
  ]);

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
  await knex.schema.dropTableIfExists("roles");
}
