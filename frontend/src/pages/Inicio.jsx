// src/pages/Inicio.jsx
import { motion } from "framer-motion"
import Card from "../components/card"

export default function Inicio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fondo via-white to-fondo text-texto flex flex-col">
      
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-5 shadow-md bg-white/80 backdrop-blur-sm">
        {/* Logo + Título */}
        <div className="flex items-center gap-3">
          <img
            src="/img/sena-logo.png"
            alt="Logo SENA"
            className="w-12 h-12 object-contain"
          />
          <h1 className="text-xl md:text-2xl font-bold text-principal tracking-wide">
            Control Formatos de Pagos
          </h1>
        </div>

        {/* Botón de administrador */}
        <a
          href="/login"
          className="bg-principal text-blanco px-5 py-2 rounded-lg shadow-md text-sm font-medium hover:bg-hover transition"
        >
          Administrador
        </a>
      </header>

      {/* Contenido central */}
      <main className="flex flex-1 justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Card />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} Control de Formatos de Pagos · Todos los derechos reservados
      </footer>
    </div>
  )
}
