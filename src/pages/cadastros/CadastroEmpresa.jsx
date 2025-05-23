import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaSignOutAlt, FaClock, FaTimesCircle, FaBuilding, FaChartLine } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";

const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
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

const StatusMessage = styled.div`
  padding: 2rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  max-width: 600px;
  width: 100%;
`;

const PendingMessage = styled(StatusMessage)`
  background-color: #fefcbf;
  color: #92400e;
`;

const RejectedMessage = styled(StatusMessage)`
  background-color: #fdecea;
  color: #9f1239;
`;

const StatusIcon = styled.div`
  font-size: 2.5rem;
`;

const LogoutButton = styled.button`
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #dc2626;
  }
`;

const CadastroFuncionarioButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #2563eb;
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

const DashboardEmpresa = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndApproval = async () => {
      const storedUser = localStorage.getItem("user");
      const storedUserType = localStorage.getItem("userType");

      if (!storedUser || storedUserType !== "empresa") {
        navigate("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const { data, error } = await supabase
          .from("empresas")
          .select("aprovacao")
          .eq("id", parsedUser.id)
          .single();

        if (error) throw error;
        setApprovalStatus(data?.aprovacao || "pendente");
      } catch (error) {
        console.error("Error:", error);
        setApprovalStatus("erro");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndApproval();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  if (loading) {
    return <Container>Carregando...</Container>;
  }

  if (approvalStatus === "pendente") {
    return (
      <Container>
        <PendingMessage>
          <StatusIcon>
            <FaClock />
          </StatusIcon>
          <h2>Seu cadastro está em análise</h2>
          <p>
            Estamos avaliando suas informações. Você receberá uma notificação
            assim que o processo for concluído. Agradecemos sua paciência.
          </p>
        </PendingMessage>
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt />
          Sair
        </LogoutButton>
      </Container>
    );
  }

  if (approvalStatus === "recusada") {
    return (
      <Container>
        <RejectedMessage>
          <StatusIcon>
            <FaTimesCircle />
          </StatusIcon>
          <h2>Cadastro não aprovado</h2>
          <p>
            Seu cadastro não foi aprovado pela nossa equipe. Entre em contato
            com nosso suporte para mais informações.
          </p>
        </RejectedMessage>
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt />
          Sair
        </LogoutButton>
      </Container>
    );
  }

  // Se a empresa estiver aprovada
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
        Bem-vindo(a), <strong>{user?.nome}</strong>!
        <p>
          Você está logado como <strong>Empresa</strong>.
        </p>
      </WelcomeMessage>

      <CompanySection>
        <SectionTitle>
          <FaBuilding />
          Área da Empresa
        </SectionTitle>
        <p>Gerencie seus serviços, colaboradores e relatórios aqui.</p>

        <CadastroFuncionarioButton
          onClick={() => navigate("/cadastro_funcionario")}
        >
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
