import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaSignOutAlt,
  FaExclamationTriangle,
  FaArrowLeft,
  FaCheckSquare,
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

const HistoricoButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: rgb(16, 61, 185);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background-color: rgb(0, 116, 184);
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 80%;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.3s ease-in-out;

  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
const CloseButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.7rem 1.5rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background-color: #dc2626;
  }
`;
const ModalTitle = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #1e3a8a;
  text-align: center;
`;
const MensagemItem = styled.li`
  background-color: #f1f5f9;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease;

  &:hover {
    background-color: #e2e8f0;
  }

  strong {
    color: #1e3a8a;
    font-weight: 600;
  }

  .mensagem-texto {
    color: #334155;
    margin-top: 0.3rem;
    font-size: 1rem;
  }

  .mensagem-data {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #64748b;
    text-align: right;
  }
`;
const MensagensList = styled.ul`
  margin-top: 1rem;
  padding: 0;
  list-style: none;
  max-height: 300px;
  overflow-y: auto;
`;

const DashboardOcorrenciasFinalizadas = () => {
  const navigate = useNavigate();
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  // CORREÇÃO: Removido o estado `atendimentoAtual` que não era utilizado
  const [modalAberto, setModalAberto] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);

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
        const empresa = JSON.parse(storedUser);

        const { data: ocorrenciasData, error: ocorrenciasError } =
          await supabase
            .from("Animais")
            .select("*")
            .eq("finalizado", true)
            .eq("Id_Empresa", empresa.id);

        if (ocorrenciasError) throw ocorrenciasError;

        setOcorrencias(ocorrenciasData || []);

        // CORREÇÃO: A segunda chamada ao supabase foi removida.
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setErrorMsg("Erro ao carregar os dados. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAbrirHistorico = (animal) => {
    try {
      setAnimalSelecionado(animal);
      const mensagens = Array.isArray(animal.mensagens_empresa)
        ? animal.mensagens_empresa
        : JSON.parse(animal.mensagens_empresa || "[]");
      setMensagens(mensagens);
      setModalAberto(true);
    } catch (error) {
      console.error("Erro ao abrir modal:", error);
      setMensagens([]);
      setModalAberto(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const handleBack = () => {
    navigate(-1);
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
          <FaCheckSquare style={{ marginRight: "0.5rem" }} />
          Ocorrências Finalizadas
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
                {item.finalizado && (
                  <InfoLine>
                    <strong>Status:</strong> Finalizado
                  </InfoLine>
                )}
              </InfoGroup>
              <HistoricoButton onClick={() => handleAbrirHistorico(item)}>
                Ver Histórico
              </HistoricoButton>
            </Card>
          ))
        ) : (
          <p style={{ color: "#64748b", textAlign: "center" }}>
            Nenhuma ocorrência finalizada encontrada.
          </p>
        )}
      </List>
      {modalAberto && (
        <ModalOverlay onClick={() => setModalAberto(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Histórico da Ocorrência</ModalTitle>

            {mensagens.length > 0 ? (
              <>
                <p style={{ color: "#64748b", textAlign: "center" }}>
                  <FaCheckSquare style={{ marginRight: "0.5rem" }} />
                  Atendimento concluído.
                </p>
                <MensagensList>
                  {mensagens.map((msg, index) => (
                    <MensagemItem key={index}>
                      <div>
                        <strong>{msg.enviadoPor || "Sistema"}:</strong>
                        <p className="mensagem-texto">
                          {msg.texto || "Mensagem vazia"}
                        </p>
                      </div>
                      <div className="mensagem-data">
                        {msg.data
                          ? new Date(msg.data).toLocaleString("pt-BR")
                          : "Data desconhecida"}
                      </div>
                    </MensagemItem>
                  ))}
                </MensagensList>
              </>
            ) : (
              <p>Sem mensagens registradas para esta ocorrência.</p>
            )}

            <CloseButton onClick={() => setModalAberto(false)}>
              Fechar
            </CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default DashboardOcorrenciasFinalizadas;
