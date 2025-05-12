import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaSignOutAlt, FaBuilding, FaChartLine } from "react-icons/fa";

// Estilos (reutilizáveis ou adaptados)
const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #333;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background: #dc2626;
  }
`;

const WelcomeMessage = styled.div`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
`;

const CompanySection = styled.section`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  color: #111827;
  margin-bottom: 1rem;
`;

// Componente Principal
const DashboardEmpresa = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Verifica autenticação ao carregar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");

    if (!storedUser || storedUserType !== "empresa") {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <Container>
      <Header>
        <Title>Dashboard - Empresa</Title>
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt />
          Sair
        </LogoutButton>
      </Header>

      <WelcomeMessage>
        Bem-vindo(a), <strong>{user.nome}</strong>!
        <p>Você está logado como <strong>Empresa</strong>.</p>
      </WelcomeMessage>

      {/* Seção exclusiva para empresas */}
      <CompanySection>
        <SectionTitle>
          <FaBuilding />
          Área da Empresa
        </SectionTitle>
        <p>Gerencie seus serviços, colaboradores e relatórios aqui.</p>
      </CompanySection>

      {/* Seção de métricas (exemplo) */}
      <CompanySection>
        <SectionTitle>
          <FaChartLine />
          Métricas
        </SectionTitle>
        <p>Visualize dados de desempenho e atendimentos.</p>
      </CompanySection>
    </Container>
  );
};

export default DashboardEmpresa;