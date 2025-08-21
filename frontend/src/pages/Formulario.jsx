export default function Formulario() {
  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center relative px-4">
      {/* Botón Volver */}
      <a
        href="/"
        className="absolute top-4 right-4 bg-[var(--color-principal)] text-[var(--color-blanco)] px-4 py-2 rounded-md text-sm hover:bg-[var(--color-hover)] transition"
      >
        Volver
      </a>

      <form className="bg-[var(--color-blanco)] shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-[var(--color-secundario)] mb-6">
          Formulario de Registro
        </h2>

        {/* Correo */}
        <label htmlFor="select" className="block font-semibold text-[var(--color-texto)]">
          Seleccione
        </label>
        <select
          id="select"
          name="select"
          required
          className="w-full px-4 py-2 mt-2 border border-[var(--borde-input)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
        >
          <option value="">Seleccione una opción</option>
          <option value="opcion1">GC</option>
          <option value="opcion2">GF</option>
         
        </select>

        {/* Documento */}
        <label htmlFor="documento" className="block mt-4 font-semibold text-[var(--color-texto)]">
          Número de documento
        </label>
        <input
          type="text"
          id="documento"
          name="documento"
          placeholder="123456789"
          required
          className="w-full px-4 py-2 mt-2 border border-[var(--borde-input)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
        />

        {/* Archivo */}
        <label htmlFor="archivo" className="block mt-4 font-semibold text-[var(--color-texto)]">
          Subir archivo
        </label>
        <input
          type="file"
          id="archivo"
          name="archivo"
          required
          className="w-full px-4 py-2 mt-2 border border-[var(--borde-input)] rounded-md bg-[var(--color-fondo)] focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
        />

        {/* Botón */}
        <button
          type="submit"
          className="w-full mt-6 bg-[var(--color-principal)] text-[var(--color-blanco)] py-3 rounded-md text-lg hover:bg-[var(--color-hover)] transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
