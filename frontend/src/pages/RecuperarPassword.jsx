import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [showCodigoModal, setShowCodigoModal] = useState(false);
  const [showNuevaPasswordModal, setShowNuevaPasswordModal] = useState(false);
  const [correo, setCorreo] = useState("");

  const handleRecuperar = () => {
    alert("Consulta enviada al correo ✅");
    setShowCodigoModal(true); // mostrar modal de código
  };

  const handleVerificar = () => {
    alert("Código verificado ✅");
    setShowCodigoModal(false);
    setShowNuevaPasswordModal(true); // mostrar modal de nueva contraseña
  };

  const handleEnviarNuevaPassword = () => {
    alert("Contraseña cambiada con éxito ✅");
    navigate("/login"); // redirigir al login
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-fondo)] px-4 gap-4">
      {/* Modal principal */}
      <div className="bg-[var(--color-blanco)] rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
        {/* Botón cerrar */}
        <button
          onClick={() => navigate("/login")}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center text-[var(--color-principal)] mb-6">
          Recuperar Contraseña
        </h2>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 text-left">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="Ingresa tu correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleRecuperar}
            className="w-full bg-[var(--color-principal)] text-[var(--color-blanco)] py-2 rounded-lg hover:bg-[var(--color-hover)] transition"
          >
            Recuperar
          </button>
        </form>
      </div>

      {/* Modal inferior: Ingresar código */}
      {showCodigoModal && (
        <div className="bg-[var(--color-blanco)] rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-[var(--color-texto)] mb-4 text-center">
            Introduzca el código enviado
          </h3>
          <input
            type="text"
            placeholder="Código de verificación"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
          />
          <button
            className="w-full bg-[var(--color-principal)] text-[var(--color-blanco)] py-2 rounded-lg hover:bg-[var(--color-hover)] transition"
            onClick={handleVerificar}
          >
            Verificar
          </button>
        </div>
      )}

      {/* Modal inferior: Nueva contraseña */}
      {showNuevaPasswordModal && (
        <div className="bg-[var(--color-blanco)] rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-[var(--color-texto)] mb-4 text-center">
            Cambiar contraseña para <span className="text-[var(--color-principal)]">{correo}</span>
          </h3>
          <input
            type="password"
            placeholder="Nueva contraseña"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
          />
          <button
            className="w-full bg-[var(--color-principal)] text-[var(--color-blanco)] py-2 rounded-lg hover:bg-[var(--color-hover)] transition"
            onClick={handleEnviarNuevaPassword}
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  );
}
