import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  // Filtrado por estado o búsqueda
  const filtrados = usuarios.filter((u) => {
    const matchesFiltro =
      filtro === "Todos" ? true : u.estado === filtro;
    const matchesBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.numero_doc.toLowerCase().includes(busqueda.toLowerCase());
    return matchesFiltro && matchesBusqueda;
  });

  return (
    <div className="p-6 bg-[var(--color-fondo)] min-h-screen">
      {/* Encabezado con volver y crear */}
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
          onClick={() => console.log("Abrir modal crear usuario")}
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

      {/* Tabla de usuarios */}
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
            {filtrados.map((u, idx) => (
              <tr
                key={idx}
                className="border-b last:border-none hover:bg-gray-50 text-sm"
              >
                <td className="p-3">{u.nombre}</td>
                <td className="p-3">{u.numero_doc}</td>
                <td className="p-3">{u.rol?.nombre_rol}</td>
                <td className="p-3">{u.correo}</td>
                <td className="p-3 flex gap-2">
                  <button className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white px-3 py-1 rounded-lg text-xs">
                    Editar
                  </button>
                  <button className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-lg text-xs">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {filtrados.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
