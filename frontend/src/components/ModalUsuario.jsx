// src/components/UsuarioModal.jsx
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function UsuarioModal({ isOpen, onClose, onSave, usuario }) {
  const [nombre, setNombre] = useState("");
  const [numeroDoc, setNumeroDoc] = useState("");
  const [correo, setCorreo] = useState("");
  const [rolId, setRolId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setNumeroDoc(usuario.numero_doc || "");
      setCorreo(usuario.correo || "");
      setRolId(usuario.rol_id || "");
      setPassword("");
    } else {
      setNombre("");
      setNumeroDoc("");
      setCorreo("");
      setRolId("");
      setPassword("");
    }
  }, [usuario]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { nombre, numero_doc: numeroDoc, correo, rol_id: rolId, password };

    try {
      if (usuario) {
        // Editar
        await fetch(`${API_URL}/usuarios/${usuario.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        // Crear
        await fetch(`${API_URL}/usuarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      onSave(); // refrescar tabla
      onClose(); // cerrar modal
    } catch (error) {
      console.error("Error guardando usuario", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--color-secundario)]">
          {usuario ? "Editar Usuario" : "Crear Usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <input
            type="text"
            placeholder="Número Documento"
            value={numeroDoc}
            onChange={(e) => setNumeroDoc(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <select
            value={rolId}
            onChange={(e) => setRolId(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          >
            <option value="">Seleccione Rol</option>
            <option value="1">Admin</option>
            <option value="2">Usuario</option>
          </select>

          {/* Campo contraseña solo si es Admin o si está editando Admin */}
          {rolId === "1" && (
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required={!usuario}
            />
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--color-principal)] text-white rounded-lg hover:bg-[var(--color-hover)]"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
