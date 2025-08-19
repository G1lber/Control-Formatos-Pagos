import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from './pages/Inicio';
import Formulario from './pages/Formulario';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/formulario" element={<Formulario />} />
     
    </Routes>
  );
}

export default App;