import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaSignOutAlt,
  FaBuilding,
  FaExclamationTriangle,
  FaTimesCircle,
  FaClock,
  FaArrowLeft,
} from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";

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
  max-width: 800px;
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

  &:hover {
    background: #dc2626;
  }
`;

const Message = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  color: #1e293b;
  font-size: 1.2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const WelcomeMessage = styled.div`
  font-size: 1.3rem;
  color: #4a5568;
  margin-bottom: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const OcorrenciasButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
  transition: background 0.3s ease, transform 0.2s ease;

  &:hover {
    background: #1e40af;
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const BackButton = styled.button`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background: #4b5563;
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
          .select("nome, aprovacao")
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

  const handleBack = () => {
    navigate("/");
  };

  if (loading) return <Container>Carregando...</Container>;
  if (!empresa) return <Container>Acesso não autorizado.</Container>;

  if (empresa.aprovacao === "pendente") {
    return (
      <Container>
        <Message>
          <FaClock
            size={24}
            style={{ color: "#fbbf24", marginBottom: "0.5rem" }}
          />
          <p>
            Sua solicitação de cadastro ainda está sendo analisada. Por favor,
            aguarde a aprovação.
          </p>
        </Message>
        <BackButton onClick={handleBack}>
          <FaArrowLeft /> Voltar para o Início
        </BackButton>
      </Container>
    );
  }

  if (empresa.aprovacao === "recusada") {
    return (
      <Container>
        <Message>
          <FaTimesCircle
            size={24}
            style={{ color: "#ef4444", marginBottom: "0.5rem" }}
          />
          <p>
            Seu cadastro foi recusado. Entre em contato com o suporte para mais
            informações.
          </p>
        </Message>
        <BackButton onClick={handleBack}>
          <FaArrowLeft /> Voltar para o Início
        </BackButton>
      </Container>
    );
  }

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
          <FaBuilding size={24} />
          <h2>Bem-vindo(a), {empresa.nome}</h2>
        </WelcomeMessage>

        <Card>
          <OcorrenciasButton onClick={() => navigate("/ocorrencias")}>
            <FaExclamationTriangle /> Acessar Ocorrências
          </OcorrenciasButton>
        </Card>
      </Content>
    </Container>
  );
};

export default DashboardEmpresa;
