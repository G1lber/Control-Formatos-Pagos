import React from "react";

export default function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado");
    // Aquí luego conectarías con el backend
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center relative px-4">
      {/* Botón Volver */}
      <a
        href="/"
        className="absolute top-4 right-4 bg-[var(--color-principal)] text-[var(--color-blanco)] px-4 py-2 rounded-md text-sm hover:bg-[var(--color-hover)] transition"
      >
        Volver
      </a>

      <div className=" bg-[var(--color-blanco)] p-[40px] px-[30px] rounded-2xl shadow-[0_15px_40px_var(--color-sombra)]w-full max-w-[400px] box-border animate-fadeIn text-center">
        {/* Logo superior */}
        <div className="mb-4 flex justify-center space-y-2">
          <img src="/img/sena-logo.png" alt="Logo SENA" className="h-15" />
        </div>

        {/* Título y subtítulo */}
        <h2 className="text-2xl font-bold space-y-2 text-[var(--color-principal)]">
          Iniciar Sesión
        </h2>
        <p className="mt-5 text-[var(--color-texto)] text-sm mb-6">
          Bienvenido de nuevo, ingresa tus credenciales.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Número de documento */}
          <input
            type="text"
            id="num_doc"
            name="num_doc"
            placeholder="Número de documento"
            required
            className="w-full px-4 py-2 border border-[var(--borde-input)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
          />

          {/* Contraseña */}
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Contraseña"
            required
            className="w-full px-4 py-2 border border-[var(--borde-input)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-principal)]"
          />

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-[var(--color-principal)] text-[var(--color-blanco)] py-3 rounded-md text-lg hover:bg-[var(--color-hover)] transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
