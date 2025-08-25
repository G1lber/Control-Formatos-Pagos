import { Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeMenu() {
  const options = [
    { 
      name: "Usuarios", 
      path: "/usuarios", 
      icon: <Users className="w-10 h-10 text-[var(--color-secundario)]" />, 
      desc: "Gestiona los usuarios del sistema" 
    },
    { 
      name: "Documentos", 
      path: "/documentos", 
      icon: <FileText className="w-10 h-10 text-[var(--color-secundario)]" />, 
      desc: "Administra los documentos" 
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-fondo)] px-4">
      <div className="max-w-md w-full space-y-8">
        
        {/* Encabezado institucional */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--color-principal)]">
            Menú
          </h1>
          <p className="text-[var(--color-secundario)]/80 text-sm mt-2">
            Selecciona una de las opciones para continuar
          </p>
        </div>

        {/* Opciones */}
        {options.map((opt) => (
          <Link
            to={opt.path}
            key={opt.path}
            className="block bg-[var(--color-blanco)] shadow-sm hover:shadow-md rounded-xl p-6 transition-all duration-300 
                       border border-[var(--color-principal)] hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              {/* Ícono institucional */}
              <div className="p-3 rounded-lg">
                {opt.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-secundario)]">
                  {opt.name}
                </h2>
                <p className="text-sm text-[var(--color-texto)]/70">
                  {opt.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
