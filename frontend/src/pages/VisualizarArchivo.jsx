import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import api from "../services/api.js"; // 👈 reemplaza axios
import AlertaModal from "../components/AlertaModal.jsx";
import SuccessModal from "../components/SuccessModal.jsx"; // 👈 Importamos el nuevo componente

export default function VisualizarArchivo() {
  const { tipo, "*": rawFile } = useParams();
  const decodedUrl = decodeURIComponent(rawFile);

  const backendUrl = `${import.meta.env.VITE_API_URL}/uploads/${decodedUrl}`;
  const navigate = useNavigate();
  const docxContainerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const documentoId = searchParams.get("id");
  const [tipoArchivo, setTipoArchivo] = useState("");

  const [modoFirma, setModoFirma] = useState(false);
  const [posicionFirma, setPosicionFirma] = useState(null);

  // Estado para modal y comentario
  const [showModal, setShowModal] = useState(false);
  const [comentario, setComentario] = useState("");

  const [alerta, setAlerta] = useState({
    isOpen: false,
    tipo: "info",
    mensaje: "",
  });

  // 🆕 Nuevo estado para la alerta de éxito
  const [successAlert, setSuccessAlert] = useState({
    isOpen: false,
    mensaje: "",
  });

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ isOpen: true, tipo, mensaje });
  };

  // Detectar extensión real del archivo
  const extension = decodedUrl.split(".").pop().toLowerCase();

   useEffect(() => {
    if (alerta.isOpen) {
      const tiempo = alerta.tipo === "success" ? 3000 : 5000; // ms
      const timer = setTimeout(() => {
        setAlerta((prev) => ({ ...prev, isOpen: false }));
      }, tiempo);

      return () => clearTimeout(timer);
    }
  }, [alerta]);

  // 🆕 Lógica para cerrar la alerta de éxito después de 3 segundos
  useEffect(() => {
    if (successAlert.isOpen) {
      const timer = setTimeout(() => {
        setSuccessAlert((prev) => ({ ...prev, isOpen: false }));
        navigate("/documentos"); // 👈 Redirige al usuario después de cerrar la alerta
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successAlert, navigate]);

  // Renderizar DOCX con docx-preview
  useEffect(() => {
    if (extension === "docx") {
      fetch(backendUrl)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          renderAsync(buffer, docxContainerRef.current);
        })
        .catch((err) => console.error("Error cargando DOCX:", err));
    }
  }, [extension, backendUrl]);

  // Enviar comentario al backend
  const handleEnviarComentario = async () => {
    try {
      await api.post("/rechazo", {
        documentoId,
        mensaje: comentario,
        tipoArchivo,
      });

      mostrarAlerta("success","El comentario fue enviado al correo del contratista");
      setShowModal(false);
      setComentario("");
    } catch (error) {
      console.error(error);
      mostrarAlerta("error","Error enviando el correo ❌");
    }
  };

  // 🔹 Marcar párrafo visualmente
  const marcarFirma = (pIndex) => {
    const paragraphs = docxContainerRef.current.querySelectorAll("p");

    // limpiar marcas previas
    paragraphs.forEach((p) => p.classList.remove("firma-seleccionada"));

    // marcar nuevo párrafo
    if (pIndex !== null && paragraphs[pIndex]) {
      paragraphs[pIndex].classList.add("firma-seleccionada");
    }
  };

  // 🔹 Cuando el usuario hace clic en un párrafo
  const handleClickDoc = async (e) => {
    if (!modoFirma) return;

    const p = e.target.closest("p");
    if (!p) return;

    const paragraphs = Array.from(
      docxContainerRef.current.querySelectorAll("p")
    );
    const pIndex = paragraphs.indexOf(p);

    setPosicionFirma(pIndex);
    setModoFirma(false);
    marcarFirma(pIndex);

    // 👉 Llamar al backend para insertar el marcador {firma}
    try {
      await api.post("/documentos/insertar-marcador", {
        file: decodedUrl,
        posicion: pIndex,
      });

      alert(`📍 Marcador {firma} insertado en el párrafo ${pIndex + 1}`);
    } catch (err) {
      console.error("❌ Error insertando marcador:", err);
      alert("Error insertando marcador en el documento");
    }
  };

  // 🔹 Aprobar y firmar
  const handleAprobar = async () => {
    if (tipo === "gc" && posicionFirma === null) {
      setModoFirma(true);
      alert("👉 Haz clic en el párrafo donde irá la firma");
      return;
    }

    try {
      let endpoint =
        tipo === "gf"
          ? `${import.meta.env.VITE_API_URL}/documentos/aprobar`
          : `${import.meta.env.VITE_API_URL}/documentos/firmar-word`;

      const { data } = await api.post(endpoint, {
        file: decodedUrl,
        documentoId,
        posicion: posicionFirma,
      });

      if (data?.url) {
        // 🆕 Usamos la nueva alerta de éxito
        setSuccessAlert({
          isOpen: true,
          mensaje: "El documento ha sido firmado exitosamente y enviado al usuario.",
        });
      }
    } catch (err) {
      console.error("❌ Error firmando:", err);
      alert("Error al firmar el documento");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-5 shadow-md bg-white">
        <div className="flex items-center gap-3">
          <img
            src="/img/sena-logo.png"
            alt="Logo SENA"
            className="w-12 h-12 object-contain"
          />
          <h1 className="text-xl md:text-2xl font-bold text-principal tracking-wide">
            Visualizando archivo {tipo.toUpperCase()}
          </h1>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="bg-[var(--color-principal)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-hover)]"
        >
          Volver
        </button>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex justify-center items-center p-7">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {extension === "pdf" ? (
              <iframe
                src={backendUrl}
                className="w-full h-[75vh] border-none"
                title="Archivo PDF"
              />
            ) : extension === "docx" ? (
              <div
                ref={docxContainerRef}
                className={`docx-container w-full h-[75vh] overflow-auto ${
                  modoFirma ? "cursor-crosshair" : "cursor-default"
                }`}
                onClick={handleClickDoc}
              />
            ) : (
              <p className="text-center p-5 text-gray-500">
                Tipo de archivo no soportado
              </p>
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
            >
              Rechazar
            </button>

            <button
              onClick={handleAprobar}
              className="px-4 py-2 rounded-md bg-[var(--color-principal)] text-white hover:bg-[var(--color-hover)]"
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
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarComentario}
                className="px-4 py-2 rounded-md bg-[var(--color-principal)] text-white hover:bg-[var(--color-hover)]"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🔹 Modal de alertas */}
      <AlertaModal
        isOpen={alerta.isOpen}
        tipo={alerta.tipo}
        mensaje={alerta.mensaje}
        onClose={() => setAlerta({ ...alerta, isOpen: false })}
      />

      {/* 🆕 Alerta de éxito profesional */}
      <SuccessModal
        isOpen={successAlert.isOpen}
        mensaje={successAlert.mensaje}
      />
    </div>
  );
}