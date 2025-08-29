import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import axios from "axios";

export default function VisualizarArchivo() {
  const { tipo, "*": rawFile } = useParams();
  const decodedUrl = decodeURIComponent(rawFile);

  const backendUrl = `http://localhost:4000/uploads/${decodedUrl}`;
  const navigate = useNavigate();
  const docxContainerRef = useRef(null);

  // Estado para modal y comentario
  const [showModal, setShowModal] = useState(false);
  const [comentario, setComentario] = useState("");

  // Detectar extensión real del archivo
  const extension = decodedUrl.split(".").pop().toLowerCase();

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
      await axios.post("http://localhost:4000/api/rechazo", {
        documentoId: 123, // ⚠️ este ID lo recibes desde useParams()
        mensaje: comentario,
      });

      alert("El comentario fue enviado al correo del contratista ✅");
      setShowModal(false);
      setComentario("");
    } catch (error) {
      console.error(error);
      alert("Error enviando el correo ❌");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-5 shadow-md bg-white">
        {/* Logo + Título */}
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

        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)} 
          className="bg-[var(--color-principal)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-hover)]"
        >
          Volver
        </button>
      </header>

      {/* Contenido centrado */}
      <main className="flex-1 flex justify-center items-center p-7">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl flex flex-col overflow-hidden">
          {/* Documento */}
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
                className="docx-container w-full h-[75vh] overflow-auto"
              />
            ) : (
              <p className="text-center p-5 text-gray-500">
                Tipo de archivo no soportado
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
              Rechazar
            </button>

            <button className="px-4 py-2 rounded-md bg-[var(--color-principal)] text-white hover:bg-[var(--color-hover)]">
              Aprobar
            </button>
          </div>
        </div>
      </main>

      {/* Modal para comentario */}
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
    </div>
  );
}
