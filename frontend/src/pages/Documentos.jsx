// src/pages/Documentos.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Documentos() {
  const [filtro, setFiltro] = useState("Pendientes");

  const notificaciones = [
    {
      usuario: "Juan Pérez",
      archivo: "documento.pdf",
      fecha: "12/08/2025 - 10:35 AM",
      estado: "Pendiente",
    },
    {
      usuario: "María López",
      archivo: "contrato.docx",
      fecha: "12/08/2025 - 09:12 AM",
      estado: "Revisado",
    },
    {
      usuario: "Carlos Gómez",
      archivo: "foto.png",
      fecha: "11/08/2025 - 04:50 PM",
      estado: "Sin archivo",
    },
  ];

  const filtrados = notificaciones.filter(
    (n) => n.estado === filtro || filtro === "Todos"
  );

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6 flex flex-col lg:flex-row gap-6 relative">
      {/* Botón Volver */}
      <Link
        to="/menu"
        className="fixed top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 
                    bg-[var(--color-principal)] text-white px-3 py-2 md:px-4 md:py-2 
                    rounded-lg shadow-lg hover:bg-[var(--color-hover)] transition 
                    text-sm md:text-base"
        >
        <ArrowLeft size={18} />
        Volver
      </Link>

      {/* Card de Notificaciones */}
      <div className="bg-[var(--color-blanco)] shadow-md rounded-2xl p-6 w-full lg:w-1/3">
        <h2 className="text-xl font-bold text-[var(--color-principal)] mb-4">
          Notificaciones
        </h2>
        <div className="space-y-4">
          {notificaciones.map((n, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-gray-50 border rounded-lg p-3"
            >
              <div>
                <p className="text-sm">
                  <strong>{n.usuario}</strong> subió <em>{n.archivo}</em>
                </p>
                <small className="text-xs text-gray-500">{n.fecha}</small>
              </div>
              <button className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white text-xs px-3 py-1 rounded-lg">
                Revisar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de revisión */}
      <div className="bg-[var(--color-blanco)] shadow-md rounded-2xl p-6 w-full lg:flex-1">
        <h2 className="text-xl font-bold text-[var(--color-principal)] mb-4">
          Lista de Revisión
        </h2>

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          {["Pendientes", "Revisado", "Sin archivo", "Todos"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtro === f
                  ? "bg-[var(--color-principal)] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-2 mb-6"
        >
          <input
            type="text"
            placeholder="Buscar por nombre o documento"
            className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-principal)] outline-none"
          />
          <button className="bg-[var(--color-principal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-hover)]">
            Buscar
          </button>
        </form>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-3">Usuario</th>
                <th className="p-3">Archivo</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((n, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-none hover:bg-gray-50 text-sm"
                >
                  <td className="p-3">{n.usuario}</td>
                  <td className="p-3">{n.archivo}</td>
                  <td className="p-3">{n.fecha.split(" - ")[0]}</td>
                  <td className="p-3">{n.estado}</td>
                  <td className="p-3">
                    <button className="bg-[var(--color-principal)] hover:bg-[var(--color-hover)] text-white px-3 py-1 rounded-lg text-xs">
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
