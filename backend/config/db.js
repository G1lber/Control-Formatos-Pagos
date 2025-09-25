// backend/config/db.js
const knex = require("knex");
const dotenv = require("dotenv");
dotenv.config();

const knexInstance = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  pool: { min: 0, max: 10 }, // opcional
});

module.exports = knexInstance;