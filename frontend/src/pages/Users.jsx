import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UsuarioModal from "../components/ModalUsuario";
import { Plus, ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";
import ConfirmacionModal from "../components/ConfirmacionModal";

const API_URL = import.meta.env.VITE_API_URL;

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 8;

  // Confirmaciones
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [accion, setAccion] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");

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

  const handleEliminar = (usuarioId) => {
    setUsuarioSeleccionado({ id: usuarioId });
    setAccion("eliminar");
    setConfirmOpen(true);
  };

  // Filtro
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      query === "" ||
      u.nombre.toLowerCase().includes(query.toLowerCase()) ||
      u.numero_doc.toString().includes(query)
  );

  // Paginación
  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indicePrimero, indiceUltimo);

  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const cambiarPagina = (num) => setPaginaActual(num);

  useEffect(() => {
    setPaginaActual(1);
  }, [query]);

  const handleBuscar = (e) => {
    e.preventDefault();
    setQuery(busqueda.trim());
  };

  const confirmarAccion = async () => {
    setError("");

    if ((accion === "crear" || accion === "editar") && formData) {
      const correoExistente = usuarios.find(
        (u) =>
          u.correo.toLowerCase() === formData.correo.toLowerCase() &&
          (accion === "crear" || u.id !== usuarioEdit?.id)
      );

      const docExistente = usuarios.find(
        (u) =>
          u.numero_doc.toString() === formData.numero_doc.toString() &&
          (accion === "crear" || u.id !== usuarioEdit?.id)
      );

      if (correoExistente) {
        setError("⚠️ El correo ya está registrado.");
        return;
      }
      if (docExistente) {
        setError("⚠️ El número de documento ya está registrado.");
        return;
      }
    }

    try {
      if (accion === "crear" && formData) {
        await fetch(`${API_URL}/usuarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        fetchUsuarios();
      } else if (accion === "editar" && formData && usuarioEdit) {
        await fetch(`${API_URL}/usuarios/${usuarioEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        fetchUsuarios();
      } else if (accion === "eliminar" && usuarioSeleccionado) {
        await fetch(`${API_URL}/usuarios/${usuarioSeleccionado.id}`, {
          method: "DELETE",
        });
        fetchUsuarios();
      }
    } catch (error) {
      console.error("Error en la acción:", error);
    }

    setConfirmOpen(false);
    setModalOpen(false);
    setFormData(null);
    setUsuarioEdit(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center px-2 py-6 sm:py-10">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-principal)] hover:bg-[var(--color-hover)] transition w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={18} /> Volver
          </button>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
            Gestión de Usuarios
          </h1>

          <button
            onClick={handleCrear}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-principal)] hover:bg-[var(--color-hover)] transition w-full sm:w-auto justify-center"
          >
            <Plus size={18} /> Crear Usuario
          </button>
        </div>

        {/* Buscador */}
        <form
          onSubmit={handleBuscar}
          className="flex flex-col sm:flex-row items-stretch gap-2"
        >
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

        {/* Tabla / Cards en móvil */}
        <div className="overflow-x-auto">
          <table className="hidden sm:table w-full border-collapse text-sm">
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

          {/* Vista móvil como cards */}
          <div className="sm:hidden flex flex-col gap-4">
            {usuariosPaginados.length > 0 ? (
              usuariosPaginados.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-xl border shadow-sm bg-white flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">{u.nombre}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.rol_id === 1
                          ? "bg-green-100 text-[var(--color-principal)]"
                          : "bg-blue-100 text-[var(--color-secundario)]"
                      }`}
                    >
                      {u.rol_id === 1 ? "Admin" : "Usuario"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">📄 {u.numero_doc}</p>
                  <p className="text-sm text-gray-600">✉️ {u.correo}</p>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEditar(u)}
                      className="flex-1 px-3 py-1 rounded-lg text-xs font-medium text-white bg-[var(--color-principal)] hover:bg-[var(--color-hover)] transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(u.id)}
                      className="flex-1 px-3 py-1 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-gray-500 text-sm">
                No se encontraron usuarios
              </p>
            )}
          </div>
        </div>

        {/* Paginación */}
        <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
          <button
            disabled={paginaActual === 1}
            onClick={() => cambiarPagina(paginaActual - 1)}
            className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition 
              ${
                paginaActual === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm"
              }
            `}
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => cambiarPagina(i + 1)}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-sm font-semibold transition
                ${
                  paginaActual === i + 1
                    ? "bg-[var(--color-principal)] text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            onClick={() => cambiarPagina(paginaActual + 1)}
            className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition
              ${
                paginaActual === totalPaginas || totalPaginas === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm"
              }
            `}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Modal Usuario */}
      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUsuarioEdit(null);
        }}
        onSave={(data) => {
          const correoExistente = usuarios.find(
            (u) =>
              u.correo.toLowerCase() === data.correo.toLowerCase() &&
              (usuarioEdit ? u.id !== usuarioEdit.id : true)
          );

          if (correoExistente) {
            setError("⚠️ El correo ya está registrado.");
            setAccion(usuarioEdit ? "editar" : "crear");
            setConfirmOpen(true);
            return;
          }

          setError("");
          setFormData(data);
          setAccion(usuarioEdit ? "editar" : "crear");
          setConfirmOpen(true);
        }}
        usuario={usuarioEdit}
      />

      {/* Modal Confirmación */}
      <ConfirmacionModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setError("");
        }}
        onConfirm={confirmarAccion}
        tipo={accion}
        error={error}
      />
    </div>
  );
}
