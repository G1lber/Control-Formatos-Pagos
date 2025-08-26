// src/pages/Usuarios.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UsuarioModal from "../components/ModalUsuario";

const API_URL = import.meta.env.VITE_API_URL;

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);

  // Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios`);
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Abrir modal para crear
  const handleCrear = () => {
    setUsuarioEdit(null);
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditar = (usuario) => {
    setUsuarioEdit(usuario);
    setModalOpen(true);
  };

  // Eliminar usuario
  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
      fetchUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.numero_doc.toString().includes(busqueda)
  );

  return (
    <div className="p-6 bg-[var(--color-fondo)] min-h-screen">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-[var(--color-principal)] text-gray-800 px-4 py-2 rounded-lg hover:bg-[var(--color-hover)] transition"
        >
          Volver
        </button>

        <h1 className="text-2xl font-bold text-[var(--color-principal)]">
          Gestión de Usuarios
        </h1>

        <button
          onClick={handleCrear}
          className="bg-[var(--color-principal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-hover)] transition"
        >
          + Crear Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o documento"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-principal)] outline-none"
        />
        <button
          onClick={() => console.log("Buscar:", busqueda)}
          className="bg-[var(--color-principal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-hover)] transition"
        >
          Buscar
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-[var(--color-blanco)] shadow-md rounded-2xl p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--color-principal)]/10 text-left text-sm">
              <th className="p-3">Nombre</th>
              <th className="p-3">Documento</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((u) => (
                <tr
                  key={u.id}
                  className="border-b last:border-none hover:bg-gray-50 text-sm"
                >
                  <td className="p-3">{u.nombre}</td>
                  <td className="p-3">{u.numero_doc}</td>
                  <td className="p-3">
                    {u.rol_id === 1 ? "Admin" : "Usuario"}
                  </td>
                  <td className="p-3">{u.correo}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEditar(u)}
                      className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(u.id)}
                      className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal (Crear/Editar) */}
      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchUsuarios}
        usuario={usuarioEdit}
      />
    </div>
  );
}
