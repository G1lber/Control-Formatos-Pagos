import { Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Inicio from './pages/Inicio';
import Formulario from './pages/Formulario';
import RecuperarPassword from "./pages/RecuperarPassword";
import NuevaPassword from "./pages/NuevaPassword";
import Menu from "./pages/Menu";
import Users from "./pages/Users.jsx";
import RutaProtegida from "./context/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Inicio />} />
      <Route path="/formulario" element={<Formulario />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/nueva-password" element={<NuevaPassword />} />

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
    </Routes>
  );
}

export default App;
