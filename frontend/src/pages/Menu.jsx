import { Users, FileText, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomeMenu() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const options = [
    {
      name: "Usuarios",
      path: "/usuarios",
      icon: <Users className="w-10 h-10 text-[var(--color-secundario)]" />,
      desc: "Gestiona los usuarios del sistema",
    },
    {
      name: "Documentos",
      path: "/documentos",
      icon: <FileText className="w-10 h-10 text-[var(--color-secundario)]" />,
      desc: "Administra los documentos",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-fondo)]">
      {/* 🔹 Navbar */}
      <header className="flex justify-between items-center px-6 py-4 shadow-md bg-white/90 backdrop-blur-sm">
        {/* Logo + Título */}
        <div className="flex items-center gap-3">
          <img
            src="/img/sena-logo.png"
            alt="Logo SENA"
            className="w-13 h-13 object-contain"
          />
          <h1 className="text-lg md:text-2xl font-bold text-[var(--color-principal)] tracking-wide">
            Bienvenido
          </h1>
        </div>

        {/* Botón cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-principal)] text-white hover:bg-[var(--color-hover)] transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </header>

      {/* 🔹 Contenido principal */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Encabezado */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--color-principal)]">
              Menú Principal
            </h2>
            <p className="text-[var(--color-secundario)]/80 text-sm mt-2">
              Selecciona una de las opciones para continuar
            </p>
          </div>

          {/* Opciones */}
          {options.map((opt) => (
            <Link
              to={opt.path}
              key={opt.path}
              className="block bg-[var(--color-blanco)] shadow-sm hover:shadow-lg rounded-xl p-6 transition-all duration-300 border border-[var(--color-principal)]"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg">{opt.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-secundario)]">
                    {opt.name}
                  </h3>
                  <p className="text-sm text-[var(--color-texto)]/70">
                    {opt.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* 🔹 Footer */}
      <footer className="text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} Control de Formatos de Pagos · Todos los derechos reservados
      </footer>
    </div>
  );
}
