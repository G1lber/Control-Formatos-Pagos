// backend/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

try {
  const conn = await pool.getConnection();
  console.log("✅ Conectado a MySQL");
  conn.release();
} catch (err) {
  console.error("❌ Error conectando a MySQL:", err);
}

export default pool;
