import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [alerta, setAlerta] = useState({ msg: "", error: false });

const handleRecuperar = async () => {
  if (!correo) {
    setAlerta({ msg: "El correo es obligatorio", error: true });
    return;
  }

  try {
    const resp = await fetch("http://localhost:3000/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo }),
    });

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error || "Error al enviar código");

    setAlerta({ msg: data.mensaje, error: false });
    setMostrarCodigo(true);
  } catch (err) {
    setAlerta({ msg: err.message, error: true });
  }
};

const handleVerificar = async () => {
  if (!codigo) {
    setAlerta({ msg: "Debes ingresar el código", error: true });
    return;
  }

  try {
    const resp = await fetch("http://localhost:3000/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, codigo }),
    });

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error || "Código inválido");

    setAlerta({ msg: "Código verificado ✅", error: false });

    setTimeout(() => {
      navigate("/nueva-password", { state: { email: correo, codigo } });
    }, 1500);
  } catch (err) {
    setAlerta({ msg: err.message, error: true });
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
        {/* Botón cerrar */}
        <button
          onClick={() => navigate("/login")}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center text-[#2E8C00] mb-6">
          Recuperar Contraseña
        </h2>

        {alerta.msg && (
          <div
            className={`${
              alerta.error
                ? "bg-red-100 text-red-700 border-red-400"
                : "bg-green-100 text-green-700 border-green-400"
            } border px-4 py-2 rounded-md mb-4 text-center`}
          >
            {alerta.msg}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {!mostrarCodigo ? (
            <>
              <div>
                <label className="block text-gray-700 mb-1 text-left font-medium">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="usuario@gmail.com.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleRecuperar}
                className="w-full bg-[#39A900] hover:bg-[#2E8C00] text-white font-semibold py-2 rounded-lg transition"
              >
                Recuperar
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-gray-700 mb-1 text-left font-medium">
                  Código de verificación
                </label>
                <input
                  type="text"
                  placeholder="Ingresa el código recibido"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleVerificar}
                className="w-full bg-[#39A900] hover:bg-[#2E8C00] text-white font-semibold py-2 rounded-lg transition"
              >
                Verificar
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
