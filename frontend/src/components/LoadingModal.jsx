import { motion } from "framer-motion";

export default function LoadingModal({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 sm:p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--color-principal)]"></div>
        </div>
        <p className="text-gray-600 font-semibold text-lg">
          Procesando firma...
        </p>
      </motion.div>
    </div>
  );
}