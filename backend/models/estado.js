import pool from "../config/db.js";

class Estado {
  // Crear nuevo estado
  static async create(nombre_estado) {
    const [result] = await pool.query(
      "INSERT INTO estados (nombre_estado) VALUES (?)",
      [nombre_estado]
    );
    return { id: result.insertId, nombre_estado };
  }

  // Buscar estado por ID
  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM estados WHERE id = ?", [id]);
    return rows[0];
  }

  // Obtener todos los estados
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM estados");
    return rows;
  }
}

export default Estado;
