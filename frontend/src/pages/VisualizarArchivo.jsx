import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import api from "../services/api.js";
import AlertaModal from "../components/AlertaModal.jsx";
import SuccessModal from "../components/SuccessModal.jsx";
import LoadingModal from "../components/LoadingModal.jsx"; // <- tu modal de carga

export default function VisualizarArchivo() {
  const { tipo, "*": rawFile } = useParams();
  const decodedUrl = rawFile ? decodeURIComponent(rawFile) : "";

  const backendUrl = decodedUrl
    ? `${import.meta.env.VITE_API_URL}/uploads/${decodedUrl}`
    : "";
  const navigate = useNavigate();
  const docxContainerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const documentoId = searchParams.get("id");
  const [tipoArchivo, setTipoArchivo] = useState("");

  const [modoFirma, setModoFirma] = useState(false);
  const [posicionFirma, setPosicionFirma] = useState(null);

  // modal, comentario, alertas, loading
  const [showModal, setShowModal] = useState(false);
  const [comentario, setComentario] = useState("");
  const [alerta, setAlerta] = useState({ isOpen: false, tipo: "info", mensaje: "" });
  const [successAlert, setSuccessAlert] = useState({ isOpen: false, mensaje: "" });
  const [loading, setLoading] = useState(false);

  // info usuario
  const [usuarioInfo, setUsuarioInfo] = useState(null);

  const mostrarAlerta = (tipo, mensaje) => setAlerta({ isOpen: true, tipo, mensaje });

  // detectar extension (segura)
  const extension = decodedUrl ? decodedUrl.split(".").pop().toLowerCase() : "";

  // Obtener info del documento/usuario
  useEffect(() => {
    if (!documentoId) return;
    let mounted = true;

    const obtenerInformacionUsuario = async () => {
      try {
        const res = await api.get(`/documentos/${documentoId}`);
        if (!mounted) return;
        if (res?.data) {
          // espera que el backend devuelva { usuarioRef: { nombre, correo, ... } }
          setUsuarioInfo(res.data.usuarioRef || null);
        }
      } catch (err) {
        console.error("Error obteniendo información del usuario:", err);
      }
    };

    obtenerInformacionUsuario();

    return () => {
      mounted = false;
    };
  }, [documentoId]);

  // Autocierre de alerta
  useEffect(() => {
    if (!alerta.isOpen) return;
    const tiempo = alerta.tipo === "success" ? 3000 : 5000;
    const t = setTimeout(() => setAlerta((p) => ({ ...p, isOpen: false })), tiempo);
    return () => clearTimeout(t);
  }, [alerta]);

  // Alerta de éxito -> redirigir después de mostrarla
  useEffect(() => {
    if (!successAlert.isOpen) return;
    const t = setTimeout(() => {
      setSuccessAlert({ isOpen: false, mensaje: "" });
      navigate("/documentos");
    }, 3000);
    return () => clearTimeout(t);
  }, [successAlert, navigate]);

  // Render docx (con abort y limpieza)
  useEffect(() => {
    if (!extension || extension !== "docx" || !backendUrl) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const cargarDocx = async () => {
      try {
        // limpia contenedor si existía algo previo
        if (docxContainerRef.current) docxContainerRef.current.innerHTML = "";
        const res = await fetch(backendUrl, { signal });
        const buffer = await res.arrayBuffer();
        // renderAsync escribirá dentro del contenedor
        await renderAsync(buffer, docxContainerRef.current);
      } catch (err) {
        if (err.name === "AbortError") {
          // cancelado por desmontaje
          return;
        }
        console.error("Error cargando DOCX:", err);
        mostrarAlerta("error", "No se pudo cargar el documento DOCX");
      }
    };

    cargarDocx();

    return () => {
      controller.abort();
      // limpiar marcas y HTML para evitar fugas visuales
      if (docxContainerRef.current) {
        docxContainerRef.current.innerHTML = "";
      }
    };
  }, [extension, backendUrl]);

  // Enviar comentario (rechazo)
  const handleEnviarComentario = async () => {
    if (!comentario?.trim()) {
      mostrarAlerta("error", "Escribe el motivo del rechazo antes de enviar.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/rechazo", {
        documentoId,
        mensaje: comentario,
        tipoArchivo,
      });

      mostrarAlerta("success", "El comentario fue enviado al correo del contratista");
      setShowModal(false);
      setComentario("");
    } catch (err) {
      console.error("Error enviando rechazo:", err);
      mostrarAlerta("error", "Error enviando el correo ❌");
    } finally {
      setLoading(false);
    }
  };

  // Marcar párrafo visualmente
  const marcarFirma = (pIndex) => {
    if (!docxContainerRef.current) return;
    const paragraphs = docxContainerRef.current.querySelectorAll("p");
    paragraphs.forEach((p) => p.classList.remove("firma-seleccionada"));
    if (pIndex !== null && paragraphs[pIndex]) paragraphs[pIndex].classList.add("firma-seleccionada");
  };

  // Click en doc (para insertar marcador en modo firma)
  const handleClickDoc = async (e) => {
    if (!modoFirma) return;
    if (!docxContainerRef.current) return;

    const p = e.target.closest("p");
    if (!p) {
      mostrarAlerta("info", "Haz clic directamente sobre el párrafo donde deseas insertar la firma.");
      return;
    }

    const paragraphs = Array.from(docxContainerRef.current.querySelectorAll("p"));
    const pIndex = paragraphs.indexOf(p);
    if (pIndex < 0) {
      mostrarAlerta("error", "No se pudo localizar el párrafo seleccionado.");
      setModoFirma(false);
      return;
    }

    setPosicionFirma(pIndex);
    setModoFirma(false);
    marcarFirma(pIndex);

    // Llamada al backend para insertar marcador
    try {
      setLoading(true);
      await api.post("/documentos/insertar-marcador", {
        file: decodedUrl,
        posicion: pIndex,
      });
      mostrarAlerta("success", `Marcador insertado en el párrafo ${pIndex + 1}`);
    } catch (err) {
      console.error("Error insertando marcador:", err);
      mostrarAlerta("error", "Error insertando marcador en el documento");
    } finally {
      setLoading(false);
    }
  };

  // Aprobar / Firmar
  const handleAprobar = async () => {
    // Si es GC (según tu lógica) y aun no hay posicion de firma -> activar modo firma
    if (tipo === "gc" && posicionFirma === null) {
      setModoFirma(true);
      mostrarAlerta("info", "👉 Haz clic en el párrafo donde irá la firma");
      return;
    }

    try {
      setLoading(true);
      const endpoint =
        tipo === "gf"
          ? `${import.meta.env.VITE_API_URL}/documentos/aprobar`
          : `${import.meta.env.VITE_API_URL}/documentos/firmar-word`;

      const { data } = await api.post(endpoint, {
        file: decodedUrl,
        documentoId,
        posicion: posicionFirma,
      });

      if (data?.url) {
        alert("✅ Documento firmado correctamente");
        const link = document.createElement("a");
        link.href = `${import.meta.env.VITE_API_URL_DOCS}${data.url}`;
        link.download = data.url.split("/").pop(); // nombre del archivo
        link.click();
        setSuccessAlert({
          isOpen: true,
          mensaje: "El documento ha sido firmado exitosamente y enviado al usuario.",
        });
        navigate("/documentos");
      } else if (data?.ok) {
        mostrarAlerta("success", "Operación completada correctamente.");
      }
    } catch (err) {
      console.error("Error firmando documento:", err);
      mostrarAlerta("error", "Error al firmar el documento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Loading modal global: lo colocamos a nivel raíz del componente
          para cubrir toda la pantalla durante operaciones asíncronas */}
      <LoadingModal isOpen={loading} />

      {/* Header */}
      <header className="flex justify-between items-center px-4 md:px-8 py-4 md:py-5 shadow-md bg-white">
        <div className="flex items-center gap-3">
          <img
            src="/img/sena-logo.png"
            alt="Logo SENA"
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
          <div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-[var(--color-principal)] tracking-wide">
              Archivo {tipo ? tipo.toUpperCase() : "—"}
            </h1>

            {usuarioInfo ? (
              <p className="mt-1 text-base md:text-lg text-[var(--color-principal)] font-semibold">
                <span className="font-bold">Usuario:</span> {usuarioInfo.nombre}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">Cargando información del usuario...</p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="bg-[var(--color-principal)] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md hover:bg-[var(--color-hover)] text-sm md:text-base"
        >
          Volver
        </button>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex justify-center items-center p-7">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {extension === "pdf" ? (
              <iframe src={backendUrl} className="w-full h-[75vh] border-none" title="Archivo PDF" />
            ) : extension === "docx" ? (
              <div
                ref={docxContainerRef}
                className={`docx-container w-full h-[75vh] overflow-auto ${modoFirma ? "cursor-crosshair" : "cursor-default"}`}
                onClick={handleClickDoc}
              />
            ) : (
              <p className="text-center p-5 text-gray-500">Tipo de archivo no soportado</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <button
              onClick={() => {
                setTipoArchivo(tipo === "gf" ? "archivo1" : "archivo2");
                setShowModal(true);
              }}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              disabled={loading}
            >
              Rechazar
            </button>

            <button
              onClick={handleAprobar}
              className="px-4 py-2 rounded-md bg-[var(--color-principal)] text-white hover:bg-[var(--color-hover)]"
              disabled={loading}
            >
              Aprobar
            </button>
          </div>
        </div>
      </main>

      {/* Modal rechazo */}
      {showModal && (
        <div className="fixed inset-0 bg-[var(--color-sombra)] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Motivo del Rechazo</h2>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full h-32 p-2 border rounded-md mb-4"
              placeholder="Escribe el motivo..."
              disabled={loading}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarComentario}
                className="px-4 py-2 rounded-md bg-[var(--color-principal)] text-white hover:bg-[var(--color-hover)]"
                disabled={loading}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales de alerta */}
      <AlertaModal isOpen={alerta.isOpen} tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta({ ...alerta, isOpen: false })} />
      <SuccessModal isOpen={successAlert.isOpen} mensaje={successAlert.mensaje} />
    </div>
  );
}

