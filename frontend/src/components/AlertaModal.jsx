// src/components/AlertaModal.jsx
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function AlertaModal({ isOpen, onClose, tipo = "info", mensaje }) {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: <CheckCircle className="w-12 h-12 text-[var(--color-principal)]" />,
      titulo: "Operación exitosa",
    },
    error: {
      icon: <XCircle className="w-12 h-12 text-red-600" />,
      titulo: "Ocurrió un error",
    },
    info: {
      icon: <Info className="w-12 h-12 text-[var(--color-secundario)]" />,
      titulo: "Información",
    },
  };

  const { icon, titulo } = config[tipo] ?? config.info;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-[var(--color-blanco)] rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
      >
        <div className="flex justify-center mb-3">{icon}</div>
        <h2 className="text-lg font-bold text-[var(--color-texto)] mb-2">{titulo}</h2>
        <p className="text-gray-600 mb-4">{mensaje}</p>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-[var(--color-principal)] text-white hover:bg-[var(--color-hover)] transition"
        >
          Cerrar
        </button>
      </motion.div>
    </div>
  );
}
