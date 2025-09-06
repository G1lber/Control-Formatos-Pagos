import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function SuccessModal({ isOpen, mensaje }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 sm:p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-[var(--color-blanco)] rounded-2xl shadow-xl w-full max-w-sm p-4 sm:p-6 text-center"
      >
        <div className="flex justify-center mb-3 sm:mb-4">
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-principal)]" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-texto)] mb-2">
          Operación Exitosa
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mb-5 sm:mb-6">
          {mensaje}
        </p>
      </motion.div>
    </div>
  );
}