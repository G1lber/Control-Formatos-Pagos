import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Inicio from './pages/Inicio';
import Formulario from './pages/Formulario';
import RecuperarPassword from "./pages/RecuperarPassword";
import NuevaPassword from "./pages/NuevaPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/formulario" element={<Formulario />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/nueva-password" element={<NuevaPassword />} />
      {/* Puedes agregar más rutas aquí según sea necesario */}
    </Routes>
  );
}

export default App;