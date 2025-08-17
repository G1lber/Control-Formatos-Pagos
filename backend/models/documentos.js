import pool from "../config/db.js";

class Documento {
  // Crear documento con 2 archivos
  static async create({ correo, nombre, numero_doc, archivo1, archivo2 }) {
    const [result] = await pool.query(
      `INSERT INTO documentos (correo, nombre, numero_doc, archivo1, archivo2, fecha) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [correo, nombre, numero_doc, archivo1, archivo2]
    );
    return {
      id: result.insertId,
      correo,
      nombre,
      numero_doc,
      archivo1,
      archivo2,
    };
  }

  // Buscar documento por número de documento
  static async findByNumeroDoc(numero_doc) {
    const [rows] = await pool.query(
      "SELECT * FROM documentos WHERE numero_doc = ?",
      [numero_doc]
    );
    return rows[0];
  }

  // Obtener todos los documentos
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM documentos");
    return rows;
  }

  // Eliminar documento por ID
  static async deleteById(id) {
    const [result] = await pool.query("DELETE FROM documentos WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }
}

export default Documento;
