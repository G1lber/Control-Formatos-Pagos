import { useState } from "react";

export default function Formulario() {
  const [documento, setDocumento] = useState("");
  const [tipo, setTipo] = useState("");
  const [archivo, setArchivo] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!archivo) {
    alert("Debes subir un archivo");
    return;
  }

  const formData = new FormData();
  formData.append("numero_doc", documento);
  formData.append("tipo", tipo);
  formData.append("archivo", archivo);

  try {
    const res = await fetch("http://localhost:4000/api/documentos/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error en la operación");
      return;
    }

    alert(data.mensaje || "Archivo subido correctamente");

    setDocumento("");
    setTipo("");
    setArchivo(null);
    document.querySelector("input[type='file']").value = "";
  } catch (err) {
    console.error(err);
    alert("❌ Error al conectar con el servidor");
  }
};
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
          <option value="1">GF</option>
          <option value="2">GC</option>
        </select>

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
          className="w-full mt-6 bg-[var(--color-principal)] text-[var(--color-blanco)] py-3 rounded-md text-lg hover:bg-[var(--color-hover)] transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
