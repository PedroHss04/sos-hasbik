import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaSignOutAlt,
  FaBuilding,
  FaChartLine,
  FaClock,
  FaTimesCircle,
  FaUsers,
  FaChartBar,
  FaCog,
  FaExclamationTriangle,
} from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";

// Estilos (reutilizáveis ou adaptados)
const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fc 0%, #e9f0f7 100%);
`;

const Content = styled.div`
  width: 100%;
  max-width: 1200px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1a365d;
  font-weight: 600;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);

  &:hover {
    background: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
  }
`;

const WelcomeMessage = styled.div`
  font-size: 1.3rem;
  color: #4a5568;
  margin-bottom: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CompanyIcon = styled(FaBuilding)`
  font-size: 2rem;
  color: #1a365d;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  color: #1a365d;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CadastroFuncionarioButton = styled.button`
  margin-top: 1.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(37, 99, 235, 0.3);
  }
`;

const DashboardEmpresa = () => {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const storedUser = localStorage.getItem("user");
      const storedUserType = localStorage.getItem("userType");

      if (!storedUser || storedUserType !== "empresa") {
        navigate("/login");
        return;
      }

      const parsedEmpresa = JSON.parse(storedUser);

      try {
        const { data, error } = await supabase
          .from("empresas")
          .select("nome")
          .eq("id", parsedEmpresa.id)
          .single();

        if (error) throw error;
        setEmpresa(data);
      } catch (err) {
        console.error("Erro ao buscar dados da empresa:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  if (loading) return <Container>Carregando...</Container>;
  if (!empresa) return <Container>Acesso não autorizado.</Container>;

  return (
    <Container>
      <Content>
        <Header>
          <Title>Dashboard da Empresa</Title>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> Sair
          </LogoutButton>
        </Header>

        <WelcomeMessage>
          <CompanyIcon />
          <div>
            <h2>Bem-vindo(a), {empresa.nome}</h2>
          </div>
        </WelcomeMessage>

        <CardGrid>
          <Card>
            <CardTitle><FaExclamationTriangle /> Acessar Ocorrências</CardTitle>
            <p>Clique aqui para acessar as ocorrências de usuários</p>
            <CadastroFuncionarioButton onClick={() => navigate("#")}>
              <FaExclamationTriangle /> Acessar Ocorrências
            </CadastroFuncionarioButton>
          </Card>

          <Card>
            <CardTitle><FaChartBar /> Relatórios</CardTitle>
            <p>Acesse relatórios detalhados e métricas de desempenho.</p>
          </Card>

          <Card>
            <CardTitle><FaCog /> Configurações</CardTitle>
            <p>Configure as preferências da sua empresa.</p>
          </Card>
        </CardGrid>
      </Content>
    </Container>
  );
};

export default DashboardEmpresa;
