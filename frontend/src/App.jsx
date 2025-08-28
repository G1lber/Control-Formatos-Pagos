import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Formulario from "./pages/Formulario";
import RecuperarPassword from "./pages/RecuperarPassword";
import NuevaPassword from "./pages/NuevaPassword";
import Menu from "./pages/Menu";
import Users from "./pages/Users.jsx";
import RutaProtegida from "./context/ProtectedRoute.jsx";
import Documentos from "./pages/Documentos";
import VisualizarArchivo from "./pages/VisualizarArchivo"; // 👈 importa la nueva page

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Inicio />} />
      <Route path="/formulario" element={<Formulario />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/nueva-password" element={<NuevaPassword />} />
      <Route path="/documentos" element={<Documentos />} />

      {/* Rutas protegidas */}
      <Route
        path="/menu"
        element={
          <RutaProtegida>
            <Menu />
          </RutaProtegida>
        }
      />
      <Route
        path="/usuarios"
        element={
          <RutaProtegida>
            <Users />
          </RutaProtegida>
        }
      />
      <Route
        path="/ver/:tipo/*"
        element={
          <RutaProtegida>
            <VisualizarArchivo />
          </RutaProtegida>
        }
      />
    </Routes>
  );
}

export default App;
