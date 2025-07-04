import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaSignOutAlt,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";

const Container = styled.div`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 2rem;
  background-color: #1e40af;
  border-radius: 10px;
  color: white;
  position: relative;
  justify-content: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  flex: 1;
`;

const ButtonGroupLeft = styled.div`
  position: absolute;
  left: 1rem;
`;

const ButtonGroupRight = styled.div`
  position: absolute;
  right: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #dc2626;
  }
`;

const List = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9fafb;
  }
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const InfoLine = styled.p`
  margin: 0;
  color: #374151;
  font-size: 0.95rem;
`;

const AtenderButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background-color: #059669;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;
const DashboardOcorrencias = () => {
  const navigate = useNavigate();
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [atendimentoAtual, setAtendimentoAtual] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");

    if (!storedUser || storedUserType !== "empresa") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        // 1. Buscar todas as ocorrências
        const { data: ocorrenciasData, error: ocorrenciasError } =
          await supabase
            .from("Animais")
            .select("*")
            .or("finalizado.is.false,finalizado.is.null")
            .or("Em_Atendimento.is.false,Em_Atendimento.is.null");

        if (ocorrenciasError) throw ocorrenciasError;

        // 2. Verificar se a empresa já está atendendo alguma ocorrência
        const empresa = JSON.parse(storedUser);
        const { data: atendimentoData, error: atendimentoError } =
          await supabase
            .from("Animais")
            .select("id")
            .eq("Id_Empresa", empresa.id)
            .eq("Em_Atendimento", true)
            .maybeSingle(); // Usando maybeSingle para evitar erros quando não há resultados

        setOcorrencias(ocorrenciasData || []);
        setAtendimentoAtual(atendimentoData ? atendimentoData.id : null);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setErrorMsg("Erro ao carregar os dados. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAtender = async (animalId) => {
    try {
      const empresaStr = localStorage.getItem("user");
      if (!empresaStr) {
        alert("Usuário não autenticado.");
        return;
      }

      const empresa = JSON.parse(empresaStr);
      const empresaId = empresa?.id;
      if (!empresaId) {
        alert("ID da empresa não encontrado.");
        return;
      }

      // Verificar se já está atendendo outra ocorrência
      if (atendimentoAtual && atendimentoAtual !== animalId) {
        alert(
          "Você já está atendendo outra ocorrência. Finalize o atendimento atual antes de aceitar outro."
        );
        return;
      }

      // Se já está atendendo esta ocorrência, não faz nada
      if (atendimentoAtual === animalId) {
        return;
      }

      const { error } = await supabase
        .from("Animais")
        .update({
          Em_Atendimento: true,
          Id_Empresa: empresaId,
        })
        .eq("id", animalId);

      if (error) throw error;

      // Atualizar o estado
      setOcorrencias((prev) =>
        prev.map((item) =>
          item.id === animalId
            ? { ...item, Em_Atendimento: true, Id_Empresa: empresaId }
            : item
        )
      );

      setAtendimentoAtual(animalId);
      alert("Ocorrência atendida com sucesso!");
    } catch (error) {
      console.error("Erro ao atender ocorrência:", error);
      alert("Erro ao atender ocorrência. Por favor, tente novamente.");
    }
  };

  if (loading) return <Container>Carregando ocorrências...</Container>;

  if (errorMsg) {
    return (
      <Container>
        <p style={{ color: "red", textAlign: "center" }}>{errorMsg}</p>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <ButtonGroupLeft>
          <BackButton onClick={handleBack}>
            <FaArrowLeft />
            Voltar
          </BackButton>
        </ButtonGroupLeft>

        <Title>
          <FaExclamationTriangle style={{ marginRight: "0.5rem" }} />
          Ocorrências Registradas
        </Title>

        <ButtonGroupRight>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt />
            Sair
          </LogoutButton>
        </ButtonGroupRight>
      </Header>

      <List>
        {ocorrencias.length > 0 ? (
          ocorrencias.map((item) => (
            <Card key={item.id}>
              <InfoGroup>
                <InfoLine>
                  <strong>Espécie:</strong> {item.Especie || "—"}
                </InfoLine>
                <InfoLine>
                  <strong>Idade:</strong> {item.Idade || "—"}
                </InfoLine>
                <InfoLine>
                  <strong>Ferido:</strong> {item.Ferido ? "Sim" : "Não"}
                </InfoLine>
                <InfoLine>
                  <strong>Endereço:</strong> {item.Endereco || "—"}
                </InfoLine>
                <InfoLine>
                  <strong>Descrição:</strong> {item.Descricao || "—"}
                </InfoLine>
                {item.Em_Atendimento && (
                  <InfoLine>
                    <strong>Status:</strong> Em atendimento
                  </InfoLine>
                )}
              </InfoGroup>

              <AtenderButton
                onClick={() => handleAtender(item.id)}
                disabled={
                  item.Em_Atendimento ||
                  (atendimentoAtual && atendimentoAtual !== item.id)
                }
              >
                {item.Em_Atendimento &&
                item.Id_Empresa === JSON.parse(localStorage.getItem("user"))?.id
                  ? "Você está atendendo"
                  : item.Em_Atendimento
                  ? "Já em Atendimento"
                  : atendimentoAtual
                  ? "Finalize o atendimento atual"
                  : "Atender Ocorrência"}
              </AtenderButton>
            </Card>
          ))
        ) : (
          <p style={{ color: "#64748b", textAlign: "center" }}>
            Nenhuma ocorrência encontrada.
          </p>
        )}
      </List>
    </Container>
  );
};

export default DashboardOcorrencias;
