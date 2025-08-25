import { useEffect, useState } from "react";
import api from "../services/api";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: "", numero_doc: "", correo: "", rol_id: "" });
  const [editId, setEditId] = useState(null);

  // Obtener usuarios al cargar
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    const res = await api.get("/usuarios");
    setUsuarios(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(`/usuarios/${editId}`, form);
    } else {
      await api.post("/usuarios", form);
    }
    setForm({ nombre: "", numero_doc: "", correo: "", rol_id: "" });
    setEditId(null);
    fetchUsuarios();
  };

  const handleEdit = (usuario) => {
    setForm(usuario);
    setEditId(usuario.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/usuarios/${id}`);
    fetchUsuarios();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Gestión de Usuarios</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Documento"
          value={form.numero_doc}
          onChange={(e) => setForm({ ...form, numero_doc: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="email"
          placeholder="Correo"
          value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Rol ID"
          value={form.rol_id}
          onChange={(e) => setForm({ ...form, rol_id: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? "Actualizar" : "Crear"}
        </button>
      </form>

      {/* Tabla */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Documento</th>
            <th className="border px-2 py-1">Correo</th>
            <th className="border px-2 py-1">Rol</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td className="border px-2 py-1">{u.nombre}</td>
              <td className="border px-2 py-1">{u.numero_doc}</td>
              <td className="border px-2 py-1">{u.correo}</td>
              <td className="border px-2 py-1">{u.rol?.nombre_rol}</td>
              <td className="border px-2 py-1 space-x-2">
                <button
                  onClick={() => handleEdit(u)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
