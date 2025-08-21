// backend/config/db.js
import knex from "knex";
import dotenv from "dotenv";
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

export default knexInstance;
