// src/components/UsuarioModal.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function UsuarioModal({ isOpen, onClose, onSave, usuario }) {
  const [formData, setFormData] = useState({
    nombre: "",
    numero_doc: "",
    correo: "",
    rol_id: "2",
    password: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (usuario) {
        setFormData({
          nombre: usuario.nombre || "",
          numero_doc: usuario.numero_doc || "",
          correo: usuario.correo || "",
          rol_id: usuario.rol_id?.toString() || "2",
          password: "", // limpiar siempre
        });
      } else {
        setFormData({
          nombre: "",
          numero_doc: "",
          correo: "",
          rol_id: "2",
          password: "",
        });
      }
    }
  }, [usuario, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.numero_doc || !formData.correo) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    // Construir data dinámica
    const data = {
      nombre: formData.nombre,
      numero_doc: formData.numero_doc,
      correo: formData.correo,
      rol_id: formData.rol_id,
    };

    // Solo enviar contraseña si es admin y se escribió
    if (formData.rol_id === "1" && formData.password.trim() !== "") {
      data.password = formData.password;
    }

    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-[var(--color-blanco)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeSlide"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-[var(--color-principal)] text-[var(--color-blanco)]">
          <h2 className="text-lg font-semibold">
            {usuario ? "Editar Usuario" : "Crear Usuario"}
          </h2>
          <button onClick={onClose} className="hover:text-gray-200 transition">
            <X size={22} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--borde-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)] shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">
              Número de Documento
            </label>
            <input
              type="number"
              name="numero_doc"
              value={formData.numero_doc}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--borde-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)] shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--borde-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)] shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">
              Rol
            </label>
            <select
              name="rol_id"
              value={formData.rol_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--borde-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)] shadow-sm"
            >
              <option value="1">Administrador</option>
              <option value="2">Usuario</option>
            </select>
          </div>

          {/* Campo contraseña solo si es Admin */}
          {formData.rol_id === "1" && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">
                {usuario ? "Nueva Contraseña" : "Contraseña"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--borde-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)] shadow-sm"
                required={!usuario} // obligatorio solo si se crea
              />
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-[var(--color-secundario)] hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-blanco)] bg-[var(--color-principal)] hover:bg-[var(--color-hover)] shadow-md transition"
            >
              {usuario ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
