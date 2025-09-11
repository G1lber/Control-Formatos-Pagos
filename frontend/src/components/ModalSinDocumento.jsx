import { X } from "lucide-react";
import { useState } from "react";
import api from "../services/api";

const ModalSinDocumento = ({ 
  isOpen, 
  onClose, 
  usuario, 
  tipoDocumento 
}) => {
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  
  if (!isOpen) return null;

  const handleEnviarCorreo = async () => {
    if (!usuario || !usuario.id) {
      setMensaje("Error: No se ha seleccionado un usuario válido");
      return;
    }

    setEnviando(true);
    setMensaje("");

    try {
      const response = await api.post("/recordatorio", {
        documentoId: usuario.id,
        tipoDocumento: tipoDocumento
      });

      if (response.data.success) {
        setMensaje("✅ Correo enviado correctamente");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMensaje("❌ Error al enviar el correo");
      }
    } catch (error) {
      console.error("Error enviando correo:", error);
      setMensaje("❌ Error al enviar el correo. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-blanco)] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-[var(--color-principal)] text-white rounded-t-xl">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-terciario)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Documentación Pendiente
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
          <div className="text-gray-600 mb-6">
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
  );
};

export default ModalSinDocumento;