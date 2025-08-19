// src/components/Card.jsx
import { motion } from "framer-motion";

export default function Card() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="
        bg-blanco p-6 sm:p-8 rounded-2xl shadow-md 
        w-full max-w-sm text-center mx-auto
      "
    >
      <h1 className="text-secundario text-xl sm:text-2xl font-bold mb-4">
        Bienvenido
      </h1>

      <p className="mb-6 text-texto text-sm sm:text-base">
        Accede al formulario para cargar tus formatos de "XXXXXX".
      </p>

      <a
        href="/formulario"
        className="
          inline-block bg-principal text-blanco 
          px-4 sm:px-6 py-2 sm:py-3 rounded-md 
          text-sm sm:text-base font-medium 
          shadow-md hover:bg-hover transition
        "
      >
        Formulario
      </a>
    </motion.div>
  );
}
