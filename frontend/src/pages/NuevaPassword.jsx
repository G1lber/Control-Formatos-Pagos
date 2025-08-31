import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function NuevaPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const correo = location.state?.email;
  const codigo = location.state?.codigo;

  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [alerta, setAlerta] = useState({ msg: "", error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password === "" || confirmarPassword === "") {
      setAlerta({ msg: "Todos los campos son obligatorios", error: true });
      return;
    }

    if (password !== confirmarPassword) {
      setAlerta({ msg: "Las contraseñas no coinciden", error: true });
      return;
    }

    try {
      const resp = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo,
          codigo,
          nuevaPassword: password,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) throw new Error(data.error || "Error al cambiar contraseña");

      setAlerta({ msg: data.mensaje, error: false });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setAlerta({ msg: err.message, error: true });
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md ]">
        <h2 className="text-2xl font-bold text-center text-[#2E8C00]">
          Nueva Contraseña
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Ingresa tu nueva contraseña para continuar
        </p>

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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Nueva Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#39A900] focus:outline-none"
              placeholder="********"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#39A900] focus:outline-none"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#39A900] hover:bg-[#2E8C00] text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Guardar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
