export async function up(knex) {
  await knex.schema.createTable("reset_codes", (table) => {
    table.increments("id").primary();
    table
      .integer("usuario_id")
      .unsigned()
      .references("id")
      .inTable("usuarios")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.string("codigo", 10).notNullable();
    table.timestamp("expires_at").notNullable();
    table.boolean("usado").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("reset_codes");
}

