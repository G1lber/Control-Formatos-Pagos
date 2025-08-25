import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
      } else {
        console.log("✅ Login exitoso:", data);
        if (data.token) localStorage.setItem("token", data.token);
        if (data.usuario) {
          localStorage.setItem("usuario", JSON.stringify(data.usuario));
          login(data.usuario);
        }
        navigate("/menu");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
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

      <div className="bg-[var(--color-blanco)] p-[40px] px-[30px] rounded-2xl shadow-[0_15px_40px_var(--color-sombra)] w-full max-w-[400px] box-border animate-fadeIn text-center">
        <div className="mb-4 flex justify-center space-y-2">
          <img src="/img/sena-logo.png" alt="Logo SENA" className="h-15" />
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-principal)]">
          Iniciar Sesión
        </h2>
        <p className="mt-5 text-[var(--color-texto)] text-sm mb-6">
          Bienvenido de nuevo, ingresa tus credenciales.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[var(--borde-input)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[var(--borde-input)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
          />

          {/* 👇 Mostrar error del backend */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-principal)] text-[var(--color-blanco)] py-3 rounded-md text-lg hover:bg-[var(--color-hover)] transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-sm">
          <a
            href="/recuperar-password"
            className="text-[var(--color-principal)] hover:underline font-medium"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
}
