import { useState, useEffect } from "react";
import api from "../services/api.js";
import {
  isActivaColombia,
  formatFechaColombia,
} from "../utils/fecha.js";

export default function Formulario() {
  const [documento, setDocumento] = useState("");
  const [tipo, setTipo] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [fechas, setFechas] = useState({ GF: null, GC: null });
  const [loading, setLoading] = useState(true);

  // 🔹 Obtener fechas desde backend (formato { fechaGF, fechaGC })
  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const { data } = await api.get("/fechas");

        // Nos aseguramos que las fechas se guarden "limpias" en UTC,
        // pero pensadas para Colombia
        setFechas({
          GF: data?.fechaGF ?? null,
          GC: data?.fechaGC ?? null,
        });
      } catch (err) {
        console.error("Error obteniendo fechas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFechas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar justo antes de enviar en hora Colombia
    if (!tipo || !isActivaColombia(fechas[tipo])) {
      alert("⚠️ La fecha límite para este tipo ya venció o no es válida.");
      return;
    }

    if (!archivo) {
      alert("Debes subir un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("numero_doc", documento);
    formData.append("tipo", tipo); // "GF" | "GC"
    formData.append("archivo", archivo);

    try {
      const res = await api.post("/documentos", formData);
      alert(res.data?.mensaje || "✅ Archivo subido correctamente");

      // Reset
      setDocumento("");
      setTipo("");
      setArchivo(null);
      const fileInput = document.querySelector("input[type='file']");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Error en la operación");
    }
  };

  const ambasVencidas =
    !isActivaColombia(fechas.GF) && !isActivaColombia(fechas.GC);

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center relative px-4">
      <a
        href="/"
        className="absolute top-4 right-4 bg-[var(--color-principal)] text-[var(--color-blanco)] px-4 py-2 rounded-md text-sm hover:bg-[var(--color-hover)] transition"
      >
        Volver
      </a>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-blanco)] shadow-lg rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-[var(--color-secundario)] mb-6">
          Formulario de Registro
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Cargando fechas...</p>
        ) : (
          <>
            {/* Avisos de estado de fechas */}
            <div className="mb-4 text-sm text-[var(--color-texto)] space-y-1">
              <p>
                <strong>GF:</strong>{" "}
                {fechas.GF
                  ? isActivaColombia(fechas.GF)
                    ? `Disponible hasta ${formatFechaColombia(fechas.GF)}`
                    : `Vencido el ${formatFechaColombia(fechas.GF)}`
                  : "Sin configurar"}
              </p>
              <p>
                <strong>GC:</strong>{" "}
                {fechas.GC
                  ? isActivaColombia(fechas.GC)
                    ? `Disponible hasta ${formatFechaColombia(fechas.GC)}`
                    : `Vencido el ${formatFechaColombia(fechas.GC)}`
                  : "Sin configurar"}
              </p>
            </div>

            {/* Selección tipo */}
            <label className="block font-semibold text-[var(--color-texto)]">
              Seleccione tipo
            </label>
            <select
              required
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-[var(--borde-input)] rounded-md"
            >
              <option value="">Seleccione una opción</option>
              {isActivaColombia(fechas.GF) && (
                <option value="GF">
                  GF (Límite: {formatFechaColombia(fechas.GF)})
                </option>
              )}
              {isActivaColombia(fechas.GC) && (
                <option value="GC">
                  GC (Límite: {formatFechaColombia(fechas.GC)})
                </option>
              )}
            </select>

            {ambasVencidas && (
              <p className="mt-2 text-sm text-red-600">
                ❌ No hay opciones disponibles: ambas fechas están vencidas.
              </p>
            )}

            {/* Documento */}
            <label className="block mt-4 font-semibold text-[var(--color-texto)]">
              Número de documento
            </label>
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="123456789"
              required
              className="w-full px-4 py-2 mt-2 border border-[var(--borde-input)] rounded-md"
            />

            {/* Archivo */}
            <label className="block mt-4 font-semibold text-[var(--color-texto)]">
              Subir archivo
            </label>
            <input
              type="file"
              onChange={(e) => setArchivo(e.target.files[0])}
              required
              className="w-full px-4 py-2 mt-2 border border-[var(--borde-input)] rounded-md"
            />

            {/* Botón */}
            <button
              type="submit"
              disabled={ambasVencidas}
              className="w-full mt-6 bg-[var(--color-principal)] disabled:opacity-60 disabled:cursor-not-allowed text-[var(--color-blanco)] py-3 rounded-md text-lg hover:bg-[var(--color-hover)] transition"
            >
              Enviar
            </button>
          </>
        )}
      </form>
    </div>
  );
}
