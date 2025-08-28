import { useParams, useNavigate } from "react-router-dom";

export default function VisualizarArchivo() {
  const { tipo, "*": rawFile } = useParams();
  const decodedUrl = decodeURIComponent(rawFile);

  const backendUrl = `http://localhost:4000/uploads/${decodedUrl}`;

  // ✅ Hook para navegar
  const navigate = useNavigate();

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
          onClick={() => navigate(-1)} // 🔙 volver atrás
          className="bg-[var(--color-principal)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-hover)]"
        >
          Volver
        </button>
      </header>

      {/* Contenido centrado */}
      <main className="flex-1 flex justify-center items-center p-7">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl flex flex-col overflow-hidden">
          {/* Documento */}
          <div className="flex-1">
            <iframe
              src={backendUrl}
              className="w-full h-[75vh] v-[60vh] border-none"
              title={`Archivo ${tipo}`}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            {/* <button className="px-4 py-2 rounded-md bg-[var(--color-secundario)] text-white hover:bg-[var(--color-hover-secundario)]">
              Cancelar
            </button> */}
            <button className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
              Rechazar
            </button>
            <button className="px-4 py-2 rounded-md bg-[var(--color-principal)] text-white hover:bg-[var(--color-hover)]">
              Aprobar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}