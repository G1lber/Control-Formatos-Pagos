// src/pages/Inicio.jsx
import Card from "./components/card"
export default function Inicio() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-fondo text-texto relative">
      {/* Botón de Administrador */}
      <a
        href="/login"
        className="absolute top-5 right-5 bg-principal text-blanco px-4 py-2 rounded shadow-md text-sm hover:bg-hover transition"
      >
        Administrador
      </a>

      {/* Tarjeta */}
      <div className="flex justify-center items-center h-screen bg-fondo">
        <Card />
      </div>
    </div>
  )
}
