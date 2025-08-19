import pool from "../config/db.js";

class Documento {
  // Crear documento (por defecto estado pendiente = 1)
  static async create({ correo, nombre, numero_doc, archivo1, archivo2, estado_id = 1 }) {
    const [result] = await pool.query(
      `INSERT INTO documentos (correo, nombre, numero_doc, archivo1, archivo2, estado_id, fecha) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [correo, nombre, numero_doc, archivo1, archivo2, estado_id]
    );
    return {
      id: result.insertId,
      correo,
      nombre,
      numero_doc,
      archivo1,
      archivo2,
      estado_id,
    };
  }

  // Buscar documento con estado
  static async findByNumeroDoc(numero_doc) {
    const [rows] = await pool.query(
      `SELECT d.*, e.nombre_estado 
       FROM documentos d
       JOIN estados e ON d.estado_id = e.id
       WHERE d.numero_doc = ?`,
      [numero_doc]
    );
    return rows[0];
  }

  // Obtener todos los documentos con su estado
  static async getAll() {
    const [rows] = await pool.query(
      `SELECT d.*, e.nombre_estado 
       FROM documentos d
       JOIN estados e ON d.estado_id = e.id`
    );
    return rows;
  }

  // Cambiar estado de un documento
  static async updateEstado(id, estado_id) {
    const [result] = await pool.query(
      "UPDATE documentos SET estado_id = ? WHERE id = ?",
      [estado_id, id]
    );
    return result.affectedRows > 0;
  }

  // Eliminar documento
  static async deleteById(id) {
    const [result] = await pool.query("DELETE FROM documentos WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }
}

export default Documento;
