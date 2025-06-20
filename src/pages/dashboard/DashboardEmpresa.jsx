import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaSignOutAlt,
  FaBuilding,
  FaExclamationTriangle,
  FaTimesCircle,
  FaClock,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPaw,
  FaFirstAid,
  FaInfoCircle,
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CurrentOcorrenciaCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const OcorrenciaTitle = styled.h3`
  font-size: 1.3rem;
  color: #1a365d;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OcorrenciaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #4a5568;
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: #3b82f6;
  color: white;
  margin-left: auto;
`;

const FinalizarButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.3s ease;

  &:hover {
    background-color: #dc2626;
  }
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
const RejectionReasonBox = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #fffbeb; /* Um amarelo bem claro */
  border-left: 5px solid #f59e0b; /* Borda amarela */
  border-radius: 8px;
  text-align: left;
  font-size: 1rem;
  color: #92400e;

  strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #b45309;
  }
`;

const DashboardEmpresa = () => {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ocorrenciaAtual, setOcorrenciaAtual] = useState(null);
  const [loadingOcorrencia, setLoadingOcorrencia] = useState(true);

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
        // Busca dados da empresa
        const { data: empresaData, error: empresaError } = await supabase
          .from("empresas")
          .select("nome, aprovacao, motivo_recusa")
          .eq("id", parsedEmpresa.id)
          .single();

        if (empresaError) throw empresaError;
        setEmpresa(empresaData);

        // Busca ocorrência em atendimento
        const { data: ocorrenciaData, error: ocorrenciaError } = await supabase
          .from("Animais")
          .select("*")
          .eq("Id_Empresa", parsedEmpresa.id)
          .eq("Em_Atendimento", true)
          .single();

        if (
          ocorrenciaError &&
          !ocorrenciaError.message.includes("No rows found")
        ) {
          throw ocorrenciaError;
        }

        setOcorrenciaAtual(ocorrenciaData || null);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
        setLoadingOcorrencia(false);
      }
    };

    checkUserAndFetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const handleFinalizarAtendimento = async () => {
    try {
      const { error } = await supabase
        .from("Animais")
        .update({
          Em_Atendimento: false,
          Id_Empresa: null,
          Finalizado: true,
        })
        .eq("id", ocorrenciaAtual.id);

      if (error) throw error;

      setOcorrenciaAtual(null);
      alert("Atendimento finalizado com sucesso!");
    } catch (error) {
      console.error("Erro ao finalizar atendimento:", error);
      alert("Erro ao finalizar atendimento. Por favor, tente novamente.");
    }
  };

  if (loading) return <Container>Carregando...</Container>;
  if (!empresa) return <Container>Acesso não autorizado.</Container>;

  if (empresa.aprovacao === "pendente") {
    return (
      <Container>
        <Message>
          <FaTimesCircle
            size={32}
            style={{ color: "#ef4444", marginBottom: "1rem" }}
          />
          <p
            style={{ fontSize: "1.4rem", fontWeight: "600", color: "#1e293b" }}
          >
            Seu cadastro foi recusado.
          </p>

          <RejectionReasonBox>
            <p>
              <strong>Os Documentos ainda estão sendo analisados</strong>
            </p>
          </RejectionReasonBox>
        </Message>

        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt /> Sair
        </LogoutButton>
      </Container>
    );
  }

  if (empresa.aprovacao === "recusada") {
    return (
      <Container>
        <Message>
          <FaTimesCircle
            size={32}
            style={{ color: "#ef4444", marginBottom: "1rem" }}
          />
          <p
            style={{ fontSize: "1.4rem", fontWeight: "600", color: "#1e293b" }}
          >
            Seu cadastro foi recusado.
          </p>

          <RejectionReasonBox>
            <strong>Motivo da recusa informado pelo administrador:</strong>
            <p>
              {empresa.motivo_recusa ||
                "Nenhum motivo específico foi fornecido. Entre em contato com o suporte para mais detalhes."}
            </p>
          </RejectionReasonBox>
        </Message>

        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt /> Sair
        </LogoutButton>
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

        {!loadingOcorrencia && ocorrenciaAtual && (
          <CurrentOcorrenciaCard>
            <OcorrenciaTitle>
              <FaExclamationTriangle /> Ocorrência em Atendimento
              <StatusBadge>Em Atendimento</StatusBadge>
            </OcorrenciaTitle>

            <OcorrenciaInfo>
              <InfoItem>
                <FaPaw /> <strong>Espécie:</strong>{" "}
                {ocorrenciaAtual.Especie || "Não informado"}
              </InfoItem>

              <InfoItem>
                <FaFirstAid /> <strong>Estado:</strong>{" "}
                {ocorrenciaAtual.Ferido ? "Animal ferido" : "Animal saudável"}
              </InfoItem>

              <InfoItem>
                <FaMapMarkerAlt /> <strong>Localização:</strong>{" "}
                {ocorrenciaAtual.Endereco || "Local não especificado"}
              </InfoItem>

              <InfoItem>
                <FaInfoCircle /> <strong>Descrição:</strong>{" "}
                {ocorrenciaAtual.Descricao || "Sem descrição adicional"}
              </InfoItem>
            </OcorrenciaInfo>

            <FinalizarButton onClick={handleFinalizarAtendimento}>
              <FaCheckCircle /> Finalizar Atendimento
            </FinalizarButton>
          </CurrentOcorrenciaCard>
        )}

        <Card>
          <OcorrenciasButton onClick={() => navigate("/ocorrencias")}>
            <FaExclamationTriangle /> Acessar Ocorrências
          </OcorrenciasButton>

          <OcorrenciasButton
            style={{
              backgroundColor: "#059669",
              boxShadow: "0 4px 14px rgba(5, 150, 105, 0.4)",
            }}
            onClick={() => navigate("/ocorrencias-atendidas")}
          >
            <FaCheckCircle /> Ocorrências Atendidas
          </OcorrenciasButton>
        </Card>
      </Content>
    </Container>
  );
};

export default DashboardEmpresa;
