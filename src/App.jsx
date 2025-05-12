import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import CadastroCidadao from "./pages/cadastros/CadastroCidadao";
import CadastroEmpresa from "./pages/cadastros/CadastroEmpresa";
import CadastroAnimal from "./pages/cadastros/CadastroAnimal";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardEmpresa from './pages/dashboard/DashboardEmpresa';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro_cidadao" element={<CadastroCidadao />} />
        <Route path="/cadastro_empresa" element={<CadastroEmpresa />} />
        <Route path="/cadastro_animal" element={<CadastroAnimal />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard_empresa" element={<DashboardEmpresa />} />
      </Routes>
    </Router>
  );
}

export default App;
