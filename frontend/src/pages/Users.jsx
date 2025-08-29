// src/pages/Usuarios.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UsuarioModal from "../components/ModalUsuario";
import { Plus, ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);

  // 🔹 Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 8;

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

  const handleCrear = () => {
    setUsuarioEdit(null);
    setModalOpen(true);
  };

  const handleEditar = (usuario) => {
    setUsuarioEdit(usuario);
    setModalOpen(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
      fetchUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  // 🔹 Filtro aplicado solo cuando se presiona Buscar
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      query === "" ||
      u.nombre.toLowerCase().includes(query.toLowerCase()) ||
      u.numero_doc.toString().includes(query)
  );

  // 🔹 Cálculo de paginado
  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indicePrimero, indiceUltimo);

  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const cambiarPagina = (num) => setPaginaActual(num);

  // 🔹 Resetear a página 1 cuando cambia búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [query]);

  // 🔹 Función para activar búsqueda
  const handleBuscar = (e) => {
    e.preventDefault();
    setQuery(busqueda.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center px-2 py-8">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6 max-h-[85vh] flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-principal)] hover:bg-[var(--color-hover)] transition"
            >
              <ArrowLeft size={18} /> Volver
            </button>

            <h1 className="text-2xl font-bold text-gray-800">
              Gestión de Usuarios
            </h1>

            <button
              onClick={handleCrear}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-principal)] hover:bg-[var(--color-hover)] transition"
            >
              <Plus size={18} /> Crear Usuario
            </button>
          </div>

          {/* Buscador */}
          <form onSubmit={handleBuscar} className="flex items-center gap-2 mb-6">
            <div className="flex items-center flex-1 border rounded-lg overflow-hidden shadow-sm">
              <Search className="ml-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre o documento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="flex-1 px-3 py-2 outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-principal)] hover:bg-[var(--color-hover)] transition"
            >
              Buscar
            </button>
          </form>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-principal)]/10 text-gray-700">
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Documento</th>
                  <th className="p-3 text-left">Rol</th>
                  <th className="p-3 text-left">Correo</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPaginados.length > 0 ? (
                  usuariosPaginados.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b last:border-none hover:bg-gray-50"
                    >
                      <td className="p-3">{u.nombre}</td>
                      <td className="p-3">{u.numero_doc}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.rol_id === 1
                              ? "bg-green-100 text-[var(--color-principal)]"
                              : "bg-blue-100 text-[var(--color-secundario)]"
                          }`}
                        >
                          {u.rol_id === 1 ? "Admin" : "Usuario"}
                        </span>
                      </td>
                      <td className="p-3">{u.correo}</td>
                      <td className="p-3 flex justify-center gap-2">
                        <button
                          onClick={() => handleEditar(u)}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-white bg-[var(--color-principal)] hover:bg-[var(--color-hover)] transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(u.id)}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500 text-sm"
                    >
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
          {/* Botón Anterior */}
          <button
            disabled={paginaActual === 1}
            onClick={() => cambiarPagina(paginaActual - 1)}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition 
              ${
                paginaActual === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm"
              }
            `}
          >
            <ChevronLeft size={18} />
            Anterior
          </button>

          {/* Números */}
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => cambiarPagina(i + 1)}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition
                ${
                  paginaActual === i + 1
                    ? "bg-[var(--color-principal)] text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Botón Siguiente */}
          <button
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            onClick={() => cambiarPagina(paginaActual + 1)}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition
              ${
                paginaActual === totalPaginas || totalPaginas === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm"
              }
            `}
          >
            Siguiente
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Modal */}
      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchUsuarios}
        usuario={usuarioEdit}
      />
    </div>
  );
}
