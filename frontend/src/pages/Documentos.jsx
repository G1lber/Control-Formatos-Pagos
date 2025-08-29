import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import CardDesplegable from "../components/CardDesplegable";
import api from "../services/api";

export default function Documentos() {
  const [filtro, setFiltro] = useState("Pendiente");
  const [fechaGF, setFechaGF] = useState("");
  const [fechaGC, setFechaGC] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [query, setQuery] = useState("");
  const dropdownRefs = useRef({}); // 👈 refs dinámicos por cada fila

  // ⬆️ Agregar estados arriba de tu componente
const [paginaActual, setPaginaActual] = useState(1);
const usuariosPorPagina = 10;

 // 1) PRIMERO: calcula `filtrados`
const filtrados = documentos.filter((n) => {
  const coincideEstado = filtro === "Todos" || n.estado?.nombre_estado === filtro;
  const coincideBusqueda =
    query === "" ||
    n.usuarioRef?.nombre?.toLowerCase().includes(query.toLowerCase()) ||
    n.usuarioRef?.numero_doc?.toString().includes(query);
  return coincideEstado && coincideBusqueda;
});

// 2) LUEGO: calcula índices y paginación usando `filtrados`
const indiceUltimo = paginaActual * usuariosPorPagina;
const indicePrimero = indiceUltimo - usuariosPorPagina;
const usuariosPaginados = filtrados.slice(indicePrimero, indiceUltimo);

// 3) Total de páginas
const totalPaginas = Math.ceil(filtrados.length / usuariosPorPagina);

// 4) Cambiar página
const cambiarPagina = (num) => setPaginaActual(num);

useEffect(() => {
  setPaginaActual(1);
}, [filtro, query]);


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

  // 👇 cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuAbierto &&
        dropdownRefs.current[menuAbierto] &&
        !dropdownRefs.current[menuAbierto].contains(event.target)
      ) {
        setMenuAbierto(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuAbierto]);

  const handleBuscar = (e) => {
    e.preventDefault();
    setQuery(busqueda.trim());
  };

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
        <form onSubmit={handleBuscar} className="flex items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o documento"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-principal)] outline-none"
          />
          <button
            type="submit"
            className="bg-[var(--color-principal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-hover)]"
          >
            Buscar
          </button>
        </form>

 {/* Tabla responsiva (PC) */}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full border-collapse">
    <thead>
      <tr className="bg-[var(--color-principal)]/10 text-left text-sm">
        <th className="p-3">Usuario</th>
        <th className="p-3">Documento</th>
        <th className="p-3">Archivo GF</th>
        <th className="p-3">Archivo GC</th>
        <th className="p-3">Fecha de registro</th>
        <th className="p-3">Estado</th>
        <th className="p-3">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {usuariosPaginados.map((n, idx) => {
        const key = `pc-${n.id || (indicePrimero + idx)}`;
        return (
          <tr key={key} className="border-b last:border-none hover:bg-gray-50 text-sm">
            <td className="p-3">{n.usuarioRef?.nombre || "—"}</td>
            <td className="p-3">{n.usuarioRef?.numero_doc || "—"}</td>
            <td className="p-3">{n.archivo1 ? "✔️" : "—"}</td>
            <td className="p-3">{n.archivo2 ? "✔️" : "—"}</td>
            <td className="p-3">{n.fecha}</td>
            <td className="p-3">{n.estado?.nombre_estado}</td>
            <td className="p-3">
              <div className="relative" ref={(el) => (dropdownRefs.current[key] = el)}>
                {n.archivo1 && n.archivo2 ? (
                  <>
                    <button
                      onClick={() =>
                        setMenuAbierto(menuAbierto === key ? null : key)
                      }
                      className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] 
                                text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                    >
                      Revisar
                    </button>
                    {menuAbierto === key && (
                      <div className="absolute left-0 mt-2 w-32 bg-[var(--color-secundario)] text-white rounded-lg shadow-lg animate-fadeIn z-20">
                        <Link
                          to={`/ver/gf/${encodeURIComponent(n.archivo1)}`}
                          onClick={() => setMenuAbierto(null)}
                          className="block px-3 py-2 text-xs font-semibold hover:bg-[var(--color-hover-secundario)] rounded-t-lg transition"
                        >
                          📄 Ver GF
                        </Link>
                        <Link
                          to={`/ver/gc/${encodeURIComponent(n.archivo2)}`}
                          onClick={() => setMenuAbierto(null)}
                          className="block px-3 py-2 text-xs font-semibold hover:bg-[var(--color-hover-secundario)] rounded-b-lg transition"
                        >
                          📄 Ver GC
                        </Link>
                      </div>
                    )}
                  </>
                ) : n.archivo1 ? (
                  <Link
                    to={`/ver/gf/${encodeURIComponent(n.archivo1)}`}
                    className="bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                  >
                    Revisar GF
                  </Link>
                ) : n.archivo2 ? (
                  <Link
                    to={`/ver/gc/${encodeURIComponent(n.archivo2)}`}
                    className="bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                  >
                    Revisar GC
                  </Link>
                ) : (
                  <span className="text-gray-400 text-xs">Sin archivo</span>
                )}
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

{/* 🔹 Paginación */}
<div className="flex justify-center items-center gap-2 mt-4">
  <button
    disabled={paginaActual === 1}
    onClick={() => cambiarPagina(paginaActual - 1)}
    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
  >
    ⬅️ Anterior
  </button>

  {Array.from({ length: totalPaginas }, (_, i) => (
    <button
      key={i}
      onClick={() => cambiarPagina(i + 1)}
      className={`px-3 py-1 rounded ${
        paginaActual === i + 1
          ? "bg-[var(--color-principal)] text-white"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
    >
      {i + 1}
    </button>
  ))}

  <button
    disabled={paginaActual === totalPaginas}
    onClick={() => cambiarPagina(paginaActual + 1)}
    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
  >
    Siguiente ➡️
  </button>
</div>


        {/* Vista alternativa para móviles */}
        <div className="md:hidden space-y-3">
          
          {usuariosPaginados.map((n, idx) => {
          const key = `movil-${n.id || (indicePrimero + idx)}`;
          return (
            <div key={key} className="bg-white border rounded-lg shadow-sm p-4 text-sm space-y-2"
                ref={(el) => (dropdownRefs.current[key] = el)}
              >
                <p><strong>👤 Usuario:</strong> {n.usuarioRef?.nombre || "—"}</p>
                <p><strong>🆔 Documento:</strong> {n.usuarioRef?.numero_doc || "—"}</p>
                <p><strong>📄 Archivo GF:</strong> {n.archivo1 ? "✔️" : "—"}</p>
                <p><strong>📄 Archivo GC:</strong> {n.archivo2 ? "✔️" : "—"}</p>
                <p><strong>📅 Fecha de registro:</strong> {n.fecha}</p>
                <p><strong>📌 Estado:</strong> {n.estado?.nombre_estado}</p>

                <div className="flex flex-wrap gap-2 relative">
                  {n.archivo1 && n.archivo2 ? (
                    <>
                      <button
                        onClick={() =>
                          setMenuAbierto(menuAbierto === key ? null : key)
                        }
                        className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                      >
                        Revisar
                      </button>
                      <div
                        className={`absolute top-9 left-0 flex flex-col gap-1 text-white font-semibold text-xs rounded-lg shadow-lg z-20 transform transition-all duration-300 ease-out
                          ${
                            menuAbierto === key
                              ? "opacity-100 scale-100 translate-y-0"
                              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                          }`}
                      >
                        <Link
                          to={`/ver/gf/${encodeURIComponent(n.archivo1)}`}
                          onClick={() => setMenuAbierto(null)}
                          className="px-3 py-2 rounded-t-lg bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] transition"
                        >
                          📄 Ver GF
                        </Link>
                        <Link
                          to={`/ver/gc/${encodeURIComponent(n.archivo2)}`}
                          onClick={() => setMenuAbierto(null)}
                          className="px-3 py-2 rounded-b-lg bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] transition"
                        >
                          📄 Ver GC
                        </Link>
                      </div>
                    </>
                  ) : n.archivo1 ? (
                    <Link
                      to={`/ver/gf/${encodeURIComponent(n.archivo1)}`}
                      className="bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                    >
                      Revisar GF
                    </Link>
                  ) : n.archivo2 ? (
                    <Link
                      to={`/ver/gc/${encodeURIComponent(n.archivo2)}`}
                      className="bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                    >
                      Revisar GC
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-xs">Sin archivo</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
