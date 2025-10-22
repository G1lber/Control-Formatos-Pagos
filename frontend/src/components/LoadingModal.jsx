import { motion } from "framer-motion";

export default function LoadingModal({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 sm:p-6 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm mx-2 p-6 sm:p-8 text-center border border-gray-100"
      >
        {/* Spinner responsivo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-t-3 border-b-3 border-[var(--color-principal)]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:w-12 bg-[var(--color-principal)] rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
        
        {/* Texto responsivo */}
        <h3 className="text-lg sm:text-xl font-bold text-[var(--color-secundario)] mb-2">
          Procesando archivo
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Estamos subiendo tu documento al sistema SENA
        </p>
        
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-[var(--color-principal)] h-2 rounded-full animate-pulse"
            style={{ width: '70%' }}
          ></div>
        </div>
        
        {/* Mensaje responsivo */}
        <p className="text-xs text-gray-500">
          Por favor no cierre esta ventana
        </p>
      </motion.div>
    </div>
  );
}