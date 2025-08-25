import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Si no hay usuario autenticado, redirigir al login
    return <Navigate to="/login" replace />;
  }

  return children;
}
