import { X } from "lucide-react";
import { useState } from "react";
import api from "../services/api";
import LoadingModal from "./LoadingModal"; // 👈 importa el modal de loading

const ModalSinDocumento = ({ 
  isOpen, 
  onClose, 
  usuario, 
  tipoDocumento, 
  onSuccess // 👈 callback para limpiar documentos.jsx
}) => {
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false); // 👈 controla el modal de carga
  
  if (!isOpen) return null;

  const handleEnviarCorreo = async () => {
    if (!usuario || !usuario.id) {
      setMensaje("Error: No se ha seleccionado un usuario válido");
      return;
    }

    setEnviando(true);
    setMensaje("");
    setLoading(true); // 👈 abre el modal de carga

    try {
      const response = await api.post("/recordatorio", {
        documentoId: usuario.id,
        tipoDocumento: tipoDocumento
      });

      if (response.data.success) {
        setTimeout(() => {
          setLoading(false); // 👈 cierra el modal de carga
          onClose();
          if (onSuccess) onSuccess(); // 👈 limpia la page documentos.jsx
        }, 1500);
      } else {
        setMensaje("❌ Error al enviar el correo");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error enviando correo:", error);
      setMensaje("❌ Error al enviar el correo. Intenta nuevamente.");
      setLoading(false);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--color-blanco)] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 animate-fade-in-up">
          
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-[var(--color-principal)] text-white rounded-t-xl">
            <h3 className="text-lg font-bold flex items-center gap-2">
              📄 Documentación Pendiente
            </h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition p-1 rounded-full hover:bg-[var(--color-hover)] focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={enviando}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6 text-[var(--color-texto)]">
            <p className="mb-4">
              ¿Estás seguro que deseas enviar un correo de recordatorio a este usuario para notificarle sobre su documentación pendiente?
            </p>
            <div className="bg-gray-100 p-4 rounded-md border border-gray-300">
              <p className="text-sm">
                <span className="font-semibold">Usuario:</span> {usuario?.usuarioRef?.nombre}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Documento:</span> {usuario?.usuarioRef?.numero_doc}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Tipo:</span> {tipoDocumento}
              </p>
            </div>

            {mensaje && (
              <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
                mensaje.includes("✅") 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {mensaje}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              onClick={handleEnviarCorreo}
              disabled={enviando}
              className="px-5 py-2 bg-[var(--color-principal)] text-white rounded-lg shadow-md hover:bg-[var(--color-hover)] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
            >
              {enviando ? "Enviando..." : "Confirmar y Enviar"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Loading */}
      <LoadingModal isOpen={loading} />
    </>
  );
};

export default ModalSinDocumento;
