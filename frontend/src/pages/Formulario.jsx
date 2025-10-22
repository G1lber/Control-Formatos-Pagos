import { useState, useEffect } from "react";
import api from "../services/api.js";
import { isActivaColombia, formatFechaColombia } from "../utils/fecha.js";
import AlertaModal from "../components/AlertaModal.jsx";
import LoadingModal from "../components/LoadingModal.jsx";

export default function Formulario() {
  const [documento, setDocumento] = useState("");
  const [tipo, setTipo] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [fechas, setFechas] = useState({ GF: null, GC: null });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alerta, setAlerta] = useState({
    isOpen: false,
    tipo: "info",
    mensaje: "",
  });

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ isOpen: true, tipo, mensaje });
  };

  // 🔹 Auto-cierre del modal después de unos segundos
  useEffect(() => {
    if (alerta.isOpen) {
      const tiempo = alerta.tipo === "success" ? 3000 : 5000;
      const timer = setTimeout(() => {
        setAlerta((prev) => ({ ...prev, isOpen: false }));
      }, tiempo);

      return () => clearTimeout(timer);
    }
  }, [alerta]);

  // 🔹 Obtener fechas desde backend
  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const { data } = await api.get("/fechas");
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

    // Validaciones previas
    if (!archivo) {
      mostrarAlerta("error", "Debes subir un archivo");
      return;
    }

    // Iniciar estado de envío
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("numero_doc", documento);
    formData.append("tipo", tipo);
    formData.append("archivo", archivo);

    try {
      const res = await api.post("/documentos", formData);
      mostrarAlerta(
        "success",
        res.data?.mensaje || "✅ Archivo subido correctamente"
      );

      // Reset del formulario
      setDocumento("");
      setTipo("");
      setArchivo(null);
      const fileInput = document.querySelector("input[type='file']");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error(err);
      mostrarAlerta(
        "error",
        err.response?.data?.error || "❌ Error al subir el archivo"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const ambasVencidas =
    !isActivaColombia(fechas.GF) && !isActivaColombia(fechas.GC);

  return (
    // 💡 Ajuste: Agregamos py-8 para dar espacio vertical en móviles
    <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center relative px-4 py-8">
      {/* 💡 Ajuste: Posicionamiento fijo en móvil para que no estorbe el scroll, y absoluto en 'sm' */}
      <a
        href="/"
        className="fixed top-4 right-4 bg-[var(--color-principal)] text-[var(--color-blanco)] px-4 py-2 rounded-md text-sm hover:bg-[var(--color-hover)] transition z-50 sm:absolute"
      >
        Volver
      </a>

      {/* 💡 Ajuste: padding p-6 en móvil, p-8 en 'sm', y un mx-4 para centrar mejor el contenedor si el viewport es pequeño pero no es max-w-md */}
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-blanco)] shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md mx-4 mt-8 sm:mt-0 relative"
      >
        {/* Overlay de carga dentro del formulario */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex items-center justify-center z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-principal)] mx-auto mb-4"></div>
              <p className="text-[var(--color-texto)] font-semibold">
                Procesando archivo...
              </p>
            </div>
          </div>
        )}

        {/* 💡 Ajuste: Título responsivo (text-xl en móvil, text-2xl en 'sm') y centrado en móvil */}
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-secundario)] mb-6 text-center sm:text-left">
          Formulario de Registro SENA
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-principal)] mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando información...</p>
          </div>
        ) : (
          <>
            {/* Avisos de estado de fechas */}
            {/* 💡 Ajuste: Ajuste de tamaño de fuente en móvil si es necesario (ya está bien con text-sm) */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-[var(--color-texto)] mb-2">
                Fechas límite:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">GF:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      fechas.GF && isActivaColombia(fechas.GF)
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {fechas.GF
                      ? isActivaColombia(fechas.GF)
                        ? `Disponible hasta ${formatFechaColombia(fechas.GF)}`
                        : `Vencido el ${formatFechaColombia(fechas.GF)}`
                      : "Sin configurar"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">GC:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      fechas.GC && isActivaColombia(fechas.GC)
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {fechas.GC
                      ? isActivaColombia(fechas.GC)
                        ? `Disponible hasta ${formatFechaColombia(fechas.GC)}`
                        : `Vencido el ${formatFechaColombia(fechas.GC)}`
                      : "Sin configurar"}
                  </span>
                </div>
              </div>
            </div>

            {/* Selección tipo */}
            <div className="mb-4">
              {/* 💡 Ajuste: Etiqueta responsiva (text-sm en móvil, text-base en 'sm') */}
              <label className="block font-semibold text-[var(--color-texto)] mb-2 text-sm sm:text-base">
                Tipo de documento *
              </label>
              <select
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                disabled={isSubmitting}
                /* 💡 Ajuste: padding px-3 en móvil, px-4 en 'sm', y tamaño de texto */
                className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-[var(--borde-input)] rounded-md focus:ring-2 focus:ring-[var(--color-principal)] focus:border-transparent transition"
              >
                <option value="">Seleccione una opción</option>
                {isActivaColombia(fechas.GF) && (
                  <option value="1">GF - Gestión Formativa</option>
                )}
                {isActivaColombia(fechas.GC) && (
                  <option value="2">GC - Gestión Contractual</option>
                )}
              </select>
            </div>

            {ambasVencidas && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">
                  ❌ No hay opciones disponibles: ambas fechas están vencidas.
                </p>
              </div>
            )}

            {/* Documento */}
            <div className="mb-4">
              {/* 💡 Ajuste: Etiqueta responsiva (text-sm en móvil, text-base en 'sm') */}
              <label className="block font-semibold text-[var(--color-texto)] mb-2 text-sm sm:text-base">
                Número de documento *
              </label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ingrese su número de documento"
                required
                disabled={isSubmitting}
                /* 💡 Ajuste: padding y tamaño de texto */
                className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-[var(--borde-input)] rounded-md focus:ring-2 focus:ring-[var(--color-principal)] focus:border-transparent transition"
              />
            </div>

            {/* Archivo */}
            <div className="mb-6">
              {/* 💡 Ajuste: Etiqueta responsiva (text-sm en móvil, text-base en 'sm') */}
              <label className="block font-semibold text-[var(--color-texto)] mb-2 text-sm sm:text-base">
                Subir archivo *
              </label>
              <input
                type="file"
                onChange={(e) => setArchivo(e.target.files[0])}
                required
                disabled={isSubmitting}
                /* 💡 Ajuste: Ajuste de padding/texto en input file si es necesario, aunque ya es complejo de estilizar */
                className="w-full px-3 sm:px-4 py-3 border border-[var(--borde-input)] rounded-md focus:ring-2 focus:ring-[var(--color-principal)] focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-principal)] file:text-[var(--color-blanco)] hover:file:bg-[var(--color-hover)]"
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={ambasVencidas || isSubmitting}
              /* 💡 Ajuste: Tamaño de texto responsivo (text-base en móvil, text-lg en 'sm') */
              className="w-full bg-[var(--color-principal)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-blanco)] py-3 px-4 rounded-md text-base sm:text-lg font-semibold hover:bg-[var(--color-hover)] transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)] focus:ring-offset-2"
            >
              {isSubmitting ? (
                /* 💡 Ajuste: Tamaño del spinner y del texto de carga en móvil */
                <span className="flex items-center justify-center text-sm sm:text-base">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Subiendo archivo...
                </span>
              ) : (
                "Enviar documento"
              )}
            </button>
          </>
        )}
      </form>

      {/* 🔹 Modal de alertas */}
      <AlertaModal
        isOpen={alerta.isOpen}
        tipo={alerta.tipo}
        mensaje={alerta.mensaje}
        onClose={() => setAlerta({ ...alerta, isOpen: false })}
      />

      {/* 🔹 Modal de carga global (opcional) */}
      <LoadingModal isOpen={isSubmitting} />
    </div>
  );
}