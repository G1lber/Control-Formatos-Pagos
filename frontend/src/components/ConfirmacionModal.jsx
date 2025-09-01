// src/components/ConfirmacionModal.jsx
import { motion } from "framer-motion";
import { CheckCircle, Edit, Trash } from "lucide-react";

export default function ConfirmacionModal({
  isOpen,
  onClose,
  onConfirm,
  tipo = "crear",
  error = ""
}) {
  if (!isOpen) return null;

  const config = {
    crear: {
      icon: <CheckCircle className="w-12 h-12 text-[var(--color-principal)]" />,
      titulo: "Confirmar Creación",
      mensaje: "¿Deseas crear este usuario?",
      btn: "Crear",
      color: "bg-[var(--color-principal)] hover:bg-[var(--color-hover)]",
    },
    editar: {
      icon: <Edit className="w-12 h-12 text-[var(--color-secundario)]" />,
      titulo: "Confirmar Edición",
      mensaje: "¿Deseas guardar los cambios en este usuario?",
      btn: "Guardar",
      color: "bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)]",
    },
    eliminar: {
      icon: <Trash className="w-12 h-12 text-red-600" />, // ⚠️ Eliminación queda roja para resaltar peligro
      titulo: "Confirmar Eliminación",
      mensaje:
        "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.",
      btn: "Eliminar",
      color: "bg-red-600 hover:bg-red-700",
    },
  };

  const { icon, titulo, mensaje, btn, color } = config[tipo] || config.crear;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-4">{icon}</div>
        <h2 className="text-xl font-bold text-[var(--color-texto)] mb-2">{titulo}</h2>
        
        {/* Mensaje de error con estilo corporativo */}
        {error && (
          <p className="text-red-600 font-medium mb-3">{error}</p>
        )}

        <p className="text-gray-600 mb-6">{mensaje}</p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${color}`}
          >
            {btn}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
