import pool from "../config/db.js";

class Admin {
  static async findByUser(usuario) {
    const [rows] = await pool.query(
      "SELECT * FROM admin WHERE usuario = ?",
      [usuario]
    );
    return rows[0];
  }

  static async create(usuario, password) {
    const [result] = await pool.query(
      "INSERT INTO admin (usuario, password) VALUES (?, ?)",
      [usuario, password]
    );
    return { id: result.insertId, usuario };
  }
}

export default Admin;