// src/components/ConfirmacionModal.jsx
import { motion } from "framer-motion";
import { CheckCircle, Edit, Trash, FileCheck, CalendarClock } from "lucide-react";

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
      icon: <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-principal)]" />,
      titulo: "Confirmar Creación",
      mensaje: "¿Deseas crear este usuario?",
      btn: "Crear",
      color: "bg-[var(--color-principal)] hover:bg-[var(--color-hover)]",
    },
    editar: {
      icon: <Edit className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-secundario)]" />,
      titulo: "Confirmar Edición",
      mensaje: "¿Deseas guardar los cambios en este usuario?",
      btn: "Guardar",
      color: "bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)]",
    },
    eliminar: {
      icon: <Trash className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />,
      titulo: "Confirmar Eliminación",
      mensaje: "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.",
      btn: "Eliminar",
      color: "bg-red-600 hover:bg-red-700",
    },
    // ✅ NUEVOS TIPOS
    activarFechas: {
      icon: <CalendarClock className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-principal)]" />,
      titulo: "Activar fechas límite",
      mensaje: "¿Deseas guardar/activar las fechas límite de GF y GC?",
      btn: "Activar",
      color: "bg-[var(--color-principal)] hover:bg-[var(--color-hover)]",
    },
    actualizarFirma: {
      icon: <FileCheck className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-secundario)]" />,
      titulo: "Actualizar firma digital",
      mensaje: "¿Deseas subir/actualizar la firma digital?",
      btn: "Actualizar",
      color: "bg-[var(--color-secundario)] hover:bg-[var(--color-hover-secundario)]",
    },
  };

  const { icon, titulo, mensaje, btn, color } = config[tipo] || config.crear;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 sm:p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-[var(--color-blanco)] rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6 text-center"
      >
        <div className="flex justify-center mb-3 sm:mb-4">{icon}</div>
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-texto)] mb-2">
          {titulo}
        </h2>

        {error && (
          <p className="text-red-600 text-sm sm:text-base font-medium mb-3">
            {error}
          </p>
        )}

        <p className="text-gray-600 text-sm sm:text-base mb-5 sm:mb-6">
          {mensaje}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-medium text-white transition ${color}`}
          >
            {btn}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
