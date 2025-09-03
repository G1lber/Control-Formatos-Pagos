import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import CardDesplegable from "../components/CardDesplegable";
import api from "../services/api";
import { toColombiaDate } from "../utils/fecha";
import {
  toColombiaInputString,
  inputColombiaToUTC,
} from "../utils/fecha";

export default function Documentos() {
  const [filtro, setFiltro] = useState("Pendiente");
  const [fechaGF, setFechaGF] = useState("");
  const [fechaGC, setFechaGC] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [dropdownPos, setDropdownPos] = useState("down");
  const [query, setQuery] = useState("");

  // 📄 paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 12;
  const dropdownRefs = useRef({});
  const [tipoArchivo, setTipoArchivo] = useState("");

  // 📌 Firma
  const [firma, setFirma] = useState(null); // URL firma guardada
  const [file, setFile] = useState(null);   // Archivo seleccionado

  // 🔍 Filtro
  const filtrados = documentos.filter((n) => {
    const coincideEstado =
      filtro === "Todos" || n.estado?.nombre_estado === filtro;

    const coincideBusqueda =
      query === "" ||
      n.usuarioRef?.nombre?.toLowerCase().includes(query.toLowerCase()) ||
      n.usuarioRef?.numero_doc?.toString().includes(query);

    return coincideEstado && coincideBusqueda;
  });

  // 🗓️ Cargar fechas
  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const { data } = await api.get("/fechas");
        if (data) {
          setFechaGF(data.fechaGF ? toColombiaInputString(data.fechaGF) : "");
          setFechaGC(data.fechaGC ? toColombiaInputString(data.fechaGC) : "");
        }
      } catch (err) {
        console.error("❌ Error al cargar fechas:", err);
      }
    };
    fetchFechas();
  }, []);

  const handleActivar = async () => {
    try {
      await api.post("/fechas", {
        fechaGF: fechaGF ? inputColombiaToUTC(fechaGF) : null,
        fechaGC: fechaGC ? inputColombiaToUTC(fechaGC) : null,
      });
      alert("Fechas guardadas ✅");
    } catch (error) {
      console.error("Error guardando fechas:", error);
      alert("❌ Error al guardar fechas");
    }
  };

  // 📄 Paginación
  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosPaginados = filtrados.slice(indicePrimero, indiceUltimo);

  const totalPaginas = Math.ceil(filtrados.length / usuariosPorPagina);
  const cambiarPagina = (num) => setPaginaActual(num);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtro, query]);

  // 📑 Cargar documentos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await api.get("/documentos");
        setDocumentos(res.data || []);
      } catch (error) {
        console.error("Error cargando documentos:", error);
      }
    };
    cargarDatos();
  }, []);

  // 📌 Cargar firma del backend
  useEffect(() => {
  const fetchFirma = async () => {
    try {
      const res = await api.get("/documentos/firma", { responseType: "blob" });
      const imgUrl = URL.createObjectURL(res.data);
      setFirma(imgUrl);
    } catch (err) {
      console.error("❌ Error al cargar firma:", err);
    }
  };
  fetchFirma();
}, []);


  // 📌 Subir/actualizar firma
const handleFirmaUpload = async () => {
  if (!file) {
    alert("⚠️ Selecciona un archivo primero");
    return;
  }
  try {
    const formData = new FormData();
    formData.append("firma", file);

    await api.post("/documentos/firma", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("✅ Firma actualizada correctamente");
    window.location.reload(); // 👈 fuerza recarga y vuelve a pedir la firma
  } catch (err) {
    console.error("❌ Error subiendo firma:", err);
    alert("Error al subir firma");
  }
};


  // 📌 Cerrar menú desplegable
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

  const handleActivar1 = () => {
    alert(
      `Fechas activadas:\nGF: ${fechaGF || "No definida"}\nGC: ${
        fechaGC || "No definida"
      }`
    );
  };

  const handleOpenMenu = (key, ref) => {
    if (menuAbierto === key) {
      setMenuAbierto(null);
      return;
    }
    if (ref?.current) {
      const rect = ref.current.getBoundingClientRect();
      const espacioAbajo = window.innerHeight - rect.bottom;
      setDropdownPos(espacioAbajo < 150 ? "up" : "down");
    }
    setMenuAbierto(key);
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-4 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6 relative">
      {/* Botón Volver */}
      <Link
        to="/menu"

        className="lg:absolute top-4 md:top-6 right-4 md:right-6 flex items-center gap-1 bg-[var(--color-principal)] 
                    text-white px-3 py-2 md:px-4 md:py-2 rounded-md shadow-md hover:bg-[var(--color-hover)] 
                    transition text-sm mb-4 lg:mb-0 self-end lg:self-auto z-10"



      >
        <ArrowLeft size={14} />
        <span className="hidden sm:inline">Volver</span>
      </Link>

      {/* Columna izquierda */}
      <Accordion.Root
        type="multiple"
        className="flex flex-col gap-4 md:gap-6 w-full lg:w-1/3 min-w-0"
      >
        {/* Notificaciones */}
        <CardDesplegable value="notificaciones" title="Notificaciones">
          <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
            {documentos.map((n) => (
              <div
                key={n.id}
                className="flex justify-between items-center bg-gray-50 border rounded-lg p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">
                    <strong>{n.usuarioRef?.nombre}</strong> subió{" "}
                    <em>{n.archivo1 || n.archivo2 || "Sin archivo"}</em>
                  </p>
                  <small className="text-xs text-gray-500">{n.fecha}</small>
                </div>
                <button className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white text-xs px-3 py-1 rounded-lg flex-shrink-0 ml-2">
                  Revisar
                </button>
              </div>
            ))}
          </div>
        </CardDesplegable>
        {/* Ajuste de Fechas */}
            <CardDesplegable value="ajusteFechas" title="Ajuste de Fechas">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha límite GF
                </label>
                <input
                  type="datetime-local"
                  value={fechaGF || ""}           // <- string para input
                  onChange={(e) => setFechaGF(e.target.value)} // <- guardas string
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-principal)] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha límite GC
                </label>
                <input
                  type="datetime-local"
                  value={fechaGC || ""}
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
           <CardDesplegable value="firma" title="Firma Digital">
            <div className="p-4 space-y-4">
              {firma ? (
                <div className="flex flex-col items-center">
                  <img
                    src={firma}
                    alt="Firma actual"
                    className="h-24 object-contain border rounded-md p-2 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">Firma actual</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tienes una firma cargada</p>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleFirmaUpload}
                  className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white px-4 py-2 rounded-md text-sm"
                >
                  {firma ? "Actualizar Firma" : "Subir Firma"}
                </button>
              </div>
            </div>
          </CardDesplegable>
      </Accordion.Root>

      {/* Columna derecha - Lista de Revisión */}
      <div className="bg-[var(--color-blanco)] shadow-md rounded-2xl p-4 w-full lg:flex-1 min-w-0 h-fit mt-4 lg:mt-0">
        <h2 className="text-xl font-bold text-[var(--color-principal)] mb-4">
          Lista de Revisión
        </h2>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["Pendiente", "Revisado", "Sin archivo", "Todos"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${
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
        <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o documento"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-principal)] outline-none text-sm"
          />
          <button
            type="submit"
            className="bg-[var(--color-principal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-hover)] text-sm"
          >
            Buscar
          </button>
        </form>

        {/* Contenedor con altura fija para mantener consistencia */}
        <div className="min-h-[600px]">
          {/* Tabla PC */}
          <div className="hidden md:block overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--color-principal)]/10 text-left text-sm">
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Documento</th>
                  <th className="p-3">Archivo GF</th>
                  <th className="p-3">Archivo GC</th>
                  <th className="p-3">Fecha de inicio</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPaginados.map((n, idx) => {
                  const key = `pc-${n.id || (indicePrimero + idx)}`;
                  const ref = { current: dropdownRefs.current[key] };
                  return (
                    <tr
                      key={key}
                      className="border-b last:border-none hover:bg-gray-50 text-sm"
                    >
                      <td className="p-3 max-w-[120px] truncate" title={n.usuarioRef?.nombre}>{n.usuarioRef?.nombre || "—"}</td>
                      <td className="p-3">{n.usuarioRef?.numero_doc || "—"}</td>
                      <td className="p-3">{n.archivo1 ? "✔️" : "—"}</td>
                      <td className="p-3">{n.archivo2 ? "✔️" : "—"}</td>
                      <td className="p-3">{n.fecha}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          n.estado?.nombre_estado === "Pendiente" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : n.estado?.nombre_estado === "Revisado"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {n.estado?.nombre_estado}
                        </span>
                      </td>
                      <td className="p-3">
                        <div
                          className="relative"
                          ref={(el) => (dropdownRefs.current[key] = el)}
                        >
                          {n.archivo1 && n.archivo2 ? (
                            <>
                              <button
                                onClick={() => handleOpenMenu(key, ref)}
                                className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] 
                                          text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                              >
                                Revisar
                              </button>
                              {menuAbierto === key && (
                                <div
                                  className={`absolute ${
                                    dropdownPos === "up"
                                      ? "bottom-full mb-2"
                                      : "top-full mt-2"
                                  } right-0 w-40 bg-[var(--color-secundario)] text-white rounded-lg shadow-lg z-50`}
                                >
                                  <Link
                                    to={`/ver/gf/${encodeURIComponent(n.archivo1)}?id=${n.id}`}
                                    onClick={() => setMenuAbierto(null)}
                                    className="block px-3 py-2 text-xs font-semibold hover:bg-[var(--color-hover-secundario)] rounded-t-lg transition"
                                  >
                                    📄 Ver GF
                                  </Link>
                                  <Link
                                    to={`/ver/gc/${encodeURIComponent(n.archivo2)}?id=${n.id}`}
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
                              to={`/ver/gf/${encodeURIComponent(n.archivo1)}?id=${n.id}`}
                              className="bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                            >
                              Revisar GF
                            </Link>
                          ) : n.archivo2 ? (
                            <Link
                              to={`/ver/gc/${encodeURIComponent(n.archivo2)}?id=${n.id}`}
                              className="bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                            >
                              Revisar GC
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              Sin archivo
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Filas vacías para mantener altura consistente */}
                {usuariosPaginados.length < usuariosPorPagina &&
                  Array.from({ length: usuariosPorPagina - usuariosPaginados.length }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="border-b last:border-none text-sm h-12">
                      <td className="p-3">—</td>
                      <td className="p-3">—</td>
                      <td className="p-3">—</td>
                      <td className="p-3">—</td>
                      <td className="p-3">—</td>
                      <td className="p-3">—</td>
                      <td className="p-3">—</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Vista móvil */}
          <div className="md:hidden space-y-3">
            {usuariosPaginados.map((n, idx) => {
              const key = `movil-${n.id || (indicePrimero + idx)}`;
              const ref = { current: dropdownRefs.current[key] };
              return (
                <div
                  key={key}
                  className="bg-white border rounded-lg shadow-sm p-4 text-sm space-y-2"
                  ref={(el) => (dropdownRefs.current[key] = el)}
                >
                  <p className="flex justify-between">
                    <span className="font-semibold">Usuario:</span>
                    <span className="text-right truncate max-w-[60%]" title={n.usuarioRef?.nombre}>{n.usuarioRef?.nombre || "—"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Documento:</span>
                    <span>{n.usuarioRef?.numero_doc || "—"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Archivo GF:</span>
                    <span>{n.archivo1 ? "✔️" : "—"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Archivo GC:</span>
                    <span>{n.archivo2 ? "✔️" : "—"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Fecha:</span>
                    <span>{n.fecha}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      n.estado?.nombre_estado === "Pendiente" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : n.estado?.nombre_estado === "Revisado"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {n.estado?.nombre_estado}
                    </span>
                  </p>

                  <div className="pt-2 flex justify-center relative w-full">
                    {n.archivo1 && n.archivo2 ? (
                      <>
                        <button
                          onClick={() => handleOpenMenu(key, ref)}
                          className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow w-full"
                        >
                          Revisar
                        </button>
                        {menuAbierto === key && (
                          <div
                            className={`absolute ${
                              dropdownPos === "up"
                                ? "bottom-full mb-2"
                                : "top-full mt-2"
                            } left-0 right-0 flex flex-col gap-1 text-white font-semibold text-sm rounded-lg shadow-lg z-50`}
                          >
                            <Link
                              to={`/ver/gf/${encodeURIComponent(n.archivo1)}?id=${n.id}`}
                              onClick={() => setMenuAbierto(null)}
                              className="px-4 py-2 rounded-t-lg bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] transition text-center"
                            >
                              📄 Ver GF
                            </Link>
                            <Link
                              to={`/ver/gc/${encodeURIComponent(n.archivo2)}?id=${n.id}`}
                              onClick={() => setMenuAbierto(null)}
                              className="px-4 py-2 rounded-b-lg bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] transition text-center"
                            >
                              📄 Ver GC
                            </Link>
                          </div>
                        )}
                      </>
                    ) : n.archivo1 ? (
                      <Link
                        to={`/ver/gf/${encodeURIComponent(n.archivo1)}?id=${n.id}`}
                        className="bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow w-full text-center"
                      >
                        Revisar GF
                      </Link>
                    ) : n.archivo2 ? (
                      <Link
                        to={`/ver/gc/${encodeURIComponent(n.archivo2)}?id=${n.id}`}
                        className="bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow w-full text-center"
                      >
                        Revisar GC
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-sm text-center w-full">Sin archivo</span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Espaciadores para mantener altura en móvil */}
            {usuariosPaginados.length < usuariosPorPagina &&
              Array.from({ length: usuariosPorPagina - usuariosPaginados.length }).map((_, idx) => (
                <div key={`empty-mobile-${idx}`} className="invisible">
                  <div className="bg-white border rounded-lg p-4 h-64"></div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            {/* Botón Anterior */}
            <button
              disabled={paginaActual === 1}
              onClick={() => cambiarPagina(paginaActual - 1)}
              className={`flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-medium transition 
                ${paginaActual === 1 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm"}
              `}
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Números */}
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                onClick={() => cambiarPagina(i + 1)}
                className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full text-xs md:text-sm font-semibold transition
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
              disabled={paginaActual === totalPaginas}
              onClick={() => cambiarPagina(paginaActual + 1)}
              className={`flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-medium transition
                ${paginaActual === totalPaginas 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm"}
              `}
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}