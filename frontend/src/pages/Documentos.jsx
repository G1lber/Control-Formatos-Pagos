import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import CardDesplegable from "../components/CardDesplegable";
import api from "../services/api"; // ✅ usamos el cliente

export default function Documentos() {
  const [filtro, setFiltro] = useState("Pendiente");
  const [fechaGF, setFechaGF] = useState("");
  const [fechaGC, setFechaGC] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(null); // 👈 controlamos el desplegable

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await api.get("/documentos");
        setDocumentos(res.data);
      } catch (error) {
        console.error("Error cargando documentos:", error);
      }
    };
    cargarDatos();
  }, []);

  // 🔹 Filtrado por estado y búsqueda
  const filtrados = documentos.filter((n) => {
    const coincideEstado =
      filtro === "Todos" || n.estado?.nombre_estado === filtro;
    const coincideBusqueda =
      n.usuarioRef?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.documento?.toString().includes(busqueda);

    return coincideEstado && coincideBusqueda;
  });

  const handleActivar = () => {
    alert(
      `Fechas activadas:\nGF: ${fechaGF || "No definida"}\nGC: ${
        fechaGC || "No definida"
      }`
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6 flex flex-col lg:flex-row gap-6 relative">
      {/* Botón Volver */}
      <Link
        to="/menu"
        className="absolute top-6 right-6 flex items-center gap-1 bg-[var(--color-principal)] 
                    text-white px-2 py-1 rounded-md shadow-md hover:bg-[var(--color-hover)] 
                    transition text-sm"
      >
        <ArrowLeft size={14} />
        Volver
      </Link>

      {/* Columna izquierda */}
      <Accordion.Root type="multiple" className="flex flex-col gap-6 w-full lg:w-1/3">
        {/* Notificaciones */}
        <CardDesplegable value="notificaciones" title="Notificaciones">
          {documentos.map((n) => (
            <div
              key={n.id}
              className="flex justify-between items-center bg-gray-50 border rounded-lg p-3"
            >
              <div>
                <p className="text-sm">
                  <strong>{n.usuarioRef?.nombre}</strong> subió{" "}
                  <em>{n.archivo1 || n.archivo2 || "Sin archivo"}</em>
                </p>
                <small className="text-xs text-gray-500">{n.fecha}</small>
              </div>
              <button className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white text-xs px-3 py-1 rounded-lg">
                Revisar
              </button>
            </div>
          ))}
        </CardDesplegable>

        {/* Ajuste de Fechas */}
        <CardDesplegable value="ajusteFechas" title="Ajuste de Fechas">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha límite GF
            </label>
            <input
              type="date"
              value={fechaGF}
              onChange={(e) => setFechaGF(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-principal)] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha límite GC
            </label>
            <input
              type="date"
              value={fechaGC}
              onChange={(e) => setFechaGC(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-principal)] outline-none text-sm"
            />
          </div>

          <button
            onClick={handleActivar}
            className="w-full bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white py-2 rounded-lg shadow-md transition"
          >
            Activar
          </button>
        </CardDesplegable>
      </Accordion.Root>

      {/* Tabla de revisión */}
      <div className="bg-[var(--color-blanco)] shadow-md rounded-2xl p-6 w-full lg:flex-1">
        <h2 className="text-xl font-bold text-[var(--color-principal)] mb-4">
          Lista de Revisión
        </h2>

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          {["Pendiente", "Revisado", "Sin archivo", "Todos"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtro === f
                  ? "bg-[var(--color-principal)] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-2 mb-6"
        >
          <input
            type="text"
            placeholder="Buscar por nombre o documento"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-principal)] outline-none"
          />
          <button className="bg-[var(--color-principal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-hover)]">
            Buscar
          </button>
        </form>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--color-principal)]/10 text-left text-sm">
                <th className="p-3">Usuario</th>
                <th className="p-3">Documento</th>
                <th className="p-3">Archivo GF</th>
                <th className="p-3">Archivo GC</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((n, idx) => (
                <tr
                  key={n.id || idx}
                  className="border-b last:border-none hover:bg-gray-50 text-sm"
                >
                  <td className="p-3">{n.usuarioRef?.nombre || "—"}</td>
                  <td className="p-3">{n.usuarioRef?.numero_doc || "—"}</td>
                  <td className="p-3">{n.archivo1 ? "✔️" : "—"}</td>
                  <td className="p-3">{n.archivo2 ? "✔️" : "—"}</td>
                  <td className="p-3">{n.fecha}</td>
                  <td className="p-3">{n.estado?.nombre_estado}</td>
                  <td className="p-3">
  {n.archivo1 && n.archivo2 ? (
    <div className="flex items-center gap-2">
      {/* Botón principal */}
      <button
        onClick={() => setMenuAbierto(menuAbierto === idx ? null : idx)}
        className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white px-3 py-1 rounded-lg text-xs"
      >
        Revisar
      </button>

      {/* Menú lateral dentro de la celda */}
      {menuAbierto === idx && (
        <div className="flex gap-1">
          <Link
            to={`/ver/gf/${encodeURIComponent(n.archivo1)}`}
            className="px-3 py-1 text-xs rounded-md bg-[var(--color-secundario)] text-white hover:bg-[var(--color-hover-secundario)]"
          >
            GF
          </Link>
          <Link
            to={`/ver/gc/${encodeURIComponent(n.archivo2)}`}
            className="px-3 py-1 text-xs rounded-md bg-[var(--color-secundario)] text-white hover:bg-[var(--color-hover-secundario)]"
          >
            GC
          </Link>
        </div>
      )}
    </div>
  ) : n.archivo1 ? (
    <Link
      to={`/ver/gf/${encodeURIComponent(n.archivo1)}`}
      className="bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] text-white px-3 py-1 rounded-lg text-xs"
    >
      Revisar GF
    </Link>
  ) : n.archivo2 ? (
    <Link
      to={`/ver/gc/${encodeURIComponent(n.archivo2)}`}
      className="bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] text-white px-3 py-1 rounded-lg text-xs"
    >
      Revisar GC
    </Link>
  ) : (
    <span className="text-gray-400 text-xs">Sin archivo</span>
  )}
</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
