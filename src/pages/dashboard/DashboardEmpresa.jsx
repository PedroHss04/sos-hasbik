import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaSignOutAlt, FaBuilding, FaChartLine, FaClock, FaTimesCircle } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";

// Estilos (reutilizáveis ou adaptados)
const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 800px;
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
  width: 100%;
  max-width: 800px;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  color: #111827;
  margin-bottom: 1rem;
`;

const AnaliseMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const PendenteMessage = styled(AnaliseMessage)`
  background-color: #fefcbf;
  color: #92400e;
`;

const RecusadaMessage = styled(AnaliseMessage)`
  background-color: #fdecea;
  color: #9f1239;
`;

// Botão para cadastrar funcionário
const CadastroFuncionarioButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #2563eb;  /* azul */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #1d4ed8;
  }
`;

// Componente Principal
const DashboardEmpresa = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [aprovacaoStatus, setAprovacaoStatus] = useState(null);
  const [loadingApprovalStatus, setLoadingApprovalStatus] = useState(true);

  // Verifica autenticação e status de aprovação ao carregar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");

    if (!storedUser || storedUserType !== "empresa") {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchApprovalStatus = async () => {
      setLoadingApprovalStatus(true);
      try {
        const { data, error } = await supabase
          .from("empresas")
          .select("aprovacao")
          .eq("id", parsedUser.id) // Assumindo que o ID da empresa está no objeto do usuário
          .single();

        if (error) {
          console.error("Erro ao buscar status de aprovação:", error);
          setAprovacaoStatus("erro");
        } else if (data) {
          setAprovacaoStatus(data.aprovacao);
        }
      } finally {
        setLoadingApprovalStatus(false);
      }
    };

    fetchApprovalStatus();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  if (!user) return null;

  if (loadingApprovalStatus) {
    return <Container>Carregando status de aprovação...</Container>;
  }

  if (aprovacaoStatus === "pendente") {
    return (
      <Container>
        <PendenteMessage>
          <FaClock />
          Sua empresa está aguardando análise. Por favor, aguarde a aprovação para acessar todas as funcionalidades do dashboard.
        </PendenteMessage>
        <Header>
          <Title>Dashboard - Empresa</Title>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt />
            Sair
          </LogoutButton>
        </Header>
        <WelcomeMessage>
          Bem-vindo(a), <strong>{user.nome}</strong>!
        </WelcomeMessage>
      </Container>
    );
  }

  if (aprovacaoStatus === "recusada") {
    return (
      <Container>
        <RecusadaMessage>
          <FaTimesCircle />
          Sua empresa foi recusada. Entre em contato com o suporte para mais informações.
        </RecusadaMessage>
        <Header>
          <Title>Dashboard - Empresa</Title>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt />
            Sair
          </LogoutButton>
        </Header>
        <WelcomeMessage>
          Bem-vindo(a), <strong>{user.nome}</strong>!
        </WelcomeMessage>
      </Container>
    );
  }

  // Se o status não for pendente nem recusado (assumindo que "aprovada" ou algum outro valor indica acesso)
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

      <CompanySection>
        <SectionTitle>
          <FaBuilding />
          Área da Empresa
        </SectionTitle>
        <p>Gerencie seus serviços, colaboradores e relatórios aqui.</p>

        <CadastroFuncionarioButton onClick={() => navigate("/cadastro_funcionario")}>
          Cadastrar Funcionário
        </CadastroFuncionarioButton>
      </CompanySection>

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
