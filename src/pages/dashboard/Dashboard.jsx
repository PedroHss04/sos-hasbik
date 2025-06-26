import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaSignOutAlt,
  FaPlus,
  FaPaw,
  FaComments,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCheckSquare,
  FaUser,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import { theme } from "../../styles/theme";
import { Container, Card, Grid } from "../../components/ui/Layout";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Alert } from "../../components/ui/Alert";

const PageContainer = styled(Container)`
  min-height: 100vh;
  background: ${theme.gradients.background};
  padding: ${theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  background: ${theme.colors.primary[600]};
  border-radius: ${theme.borderRadius.lg};
  color: white;
  box-shadow: ${theme.shadows.lg};
`;

const Title = styled.h1`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const WelcomeCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  background: ${theme.gradients.primary};
  color: white;
`;

const WelcomeTitle = styled.h2`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  margin: 0 0 ${theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
`;

const AnimalsSection = styled(Card)`
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.gray[800]};
  margin: 0 0 ${theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const AnimalCard = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.sm};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &:hover {
    background: ${theme.colors.gray[50]};
    transform: translateY(-1px);
  }
`;

const AnimalInfo = styled.div`
  flex: 1;
`;

const AnimalName = styled.h3`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.gray[800]};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const AnimalDetails = styled.p`
  margin: 0;
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
`;

const StatusBadge = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.xs};
  font-weight: 500;
  background-color: ${(props) => {
    switch (props.status) {
      case "Em Atendimento":
        return theme.colors.primary[100];
      case "Finalizado":
        return theme.colors.success[100];
      default:
        return theme.colors.warning[100];
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "Em Atendimento":
        return theme.colors.primary[800];
      case "Finalizado":
        return theme.colors.success[800];
      default:
        return theme.colors.warning[800];
    }
  }};
  margin-left: ${theme.spacing.md};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  margin-top: ${theme.spacing.xl};
`;

const CommunicationSection = styled.div`
  margin-top: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[200]};
`;

const CommunicationTitle = styled.h4`
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.gray[800]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-weight: 600;
`;

const MessageInput = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.sm};
  resize: vertical;
  min-height: 80px;
  margin-bottom: ${theme.spacing.md};
  font-family: ${theme.fonts.body};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[400]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const MessagesList = styled.div`
  margin-top: ${theme.spacing.lg};
  max-height: 300px;
  overflow-y: auto;
`;

const MessageItem = styled.div`
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.gray[200]};
  font-size: ${theme.fontSizes.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};
`;

const MessageAuthor = styled.strong`
  color: ${props => props.isUser ? theme.colors.primary[600] : theme.colors.success[600]};
  font-weight: 600;
`;

const MessageTime = styled.span`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.gray[500]};
`;

const MessageText = styled.p`
  margin: 0;
  color: ${theme.colors.gray[700]};
  line-height: 1.5;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.gray[500]};
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");

    if (!storedUser || storedUserType !== "cidadao") {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchAnimals = async () => {
      const userId = parsedUser.id;
      const { data, error } = await supabase
        .from("Animais")
        .select("*")
        .eq("Id_Usuario", userId)
        .order("Timestamp", { ascending: false });

      if (error) {
        console.error("Erro ao buscar animais:", error);
        return;
      }

      const formattedData = data.map((animal) => ({
        ...animal,
        nome: animal.Especie,
        dataCadastro: new Date(animal.Timestamp).toLocaleDateString("pt-BR"),
        idade: animal.Idade,
        descricao: animal.Descricao,
      }));

      setAnimals(formattedData);
    };

    fetchAnimals();
  }, [navigate]);

  useEffect(() => {
    if (animalSelecionado?.mensagens_empresa) {
      try {
        const msgs = JSON.parse(animalSelecionado.mensagens_empresa);
        setMensagens(Array.isArray(msgs) ? msgs : []);
      } catch {
        setMensagens([]);
      }
    } else {
      setMensagens([]);
    }

    if (animalSelecionado?.id) {
      const channel = supabase
        .channel(`animal_messages_${animalSelecionado.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "Animais",
            filter: `id=eq.${animalSelecionado.id}`,
          },
          (payload) => {
            if (payload.new.mensagens_empresa) {
              try {
                const updatedMsgs = JSON.parse(payload.new.mensagens_empresa);
                setMensagens(Array.isArray(updatedMsgs) ? updatedMsgs : []);
                setAnimalSelecionado((prev) => ({
                  ...prev,
                  mensagens_empresa: payload.new.mensagens_empresa,
                }));
                setAnimals((prevAnimals) =>
                  prevAnimals.map((animal) =>
                    animal.id === payload.new.id
                      ? {
                          ...animal,
                          mensagens_empresa: payload.new.mensagens_empresa,
                        }
                      : animal
                  )
                );
              } catch (e) {
                console.error("Erro ao parsear mensagens em tempo real:", e);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [animalSelecionado]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const handleRegisterAnimal = () => {
    navigate("/cadastro_animal");
  };

  const handleAnimalClick = (animal) => {
    setAnimalSelecionado(animal);
    setIsModalOpen(true);
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !animalSelecionado) return;

    try {
      const novaMensagemObj = {
        texto: novaMensagem,
        data: new Date().toISOString(),
        enviadoPor: user.nome,
        tipo: "usuario",
      };

      const mensagensAtualizadas = [...mensagens, novaMensagemObj];
      const mensagensString = JSON.stringify(mensagensAtualizadas);

      const { error } = await supabase
        .from("Animais")
        .update({ mensagens_empresa: mensagensString })
        .eq("id", animalSelecionado.id);

      if (error) throw error;

      setNovaMensagem("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  if (!user) return null;

  return (
    <PageContainer>
      <Header>
        <Title>
          <FaUser />
          Minha Dashboard
        </Title>
        <Button variant="danger" onClick={handleLogout}>
          <FaSignOutAlt />
          Sair
        </Button>
      </Header>

      <WelcomeCard>
        <WelcomeTitle>
          <FaPaw />
          Bem-vindo(a), {user.nome}!
        </WelcomeTitle>
        <p>Obrigado por ajudar os animais que precisam de cuidado.</p>
      </WelcomeCard>

      <AnimalsSection>
        <SectionTitle>
          <FaPaw />
          Meus Animais Reportados
        </SectionTitle>

        {animals.length > 0 ? (
          animals.map((animal) => (
            <AnimalCard
              key={animal.id}
              onClick={() => handleAnimalClick(animal)}
            >
              <AnimalInfo>
                <AnimalName>
                  🐾 {animal.nome}
                  {animal.Em_Atendimento && (
                    <StatusBadge status="Em Atendimento">
                      Em Atendimento
                    </StatusBadge>
                  )}
                  {animal.finalizado && (
                    <StatusBadge status="Finalizado">
                      Finalizado
                    </StatusBadge>
                  )}
                </AnimalName>
                <AnimalDetails>
                  <span><strong>Espécie:</strong> {animal.Especie}</span>
                  <span><strong>Idade:</strong> {animal.Idade}</span>
                  <span><FaMapMarkerAlt /> {animal.Endereco}</span>
                  <span><FaClock /> {animal.dataCadastro}</span>
                </AnimalDetails>
              </AnimalInfo>
            </AnimalCard>
          ))
        ) : (
          <EmptyState>
            <FaPaw size={48} style={{ marginBottom: theme.spacing.md, opacity: 0.5 }} />
            <p>Você ainda não reportou nenhum animal.</p>
            <p>Clique no botão abaixo para reportar um animal que precisa de ajuda.</p>
          </EmptyState>
        )}
      </AnimalsSection>

      <ActionButtons>
        <Button onClick={handleRegisterAnimal}>
          <FaPlus />
          Reportar Animal
        </Button>
      </ActionButtons>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`🐾 ${animalSelecionado?.nome || 'Animal'}`}
      >
        {animalSelecionado && (
          <div>
            <div style={{ marginBottom: theme.spacing.lg }}>
              <p><strong>Espécie:</strong> {animalSelecionado.Especie}</p>
              <p><strong>Idade:</strong> {animalSelecionado.Idade}</p>
              <p><strong>Estado:</strong> {animalSelecionado.Ferido ? "🚨 Ferido" : "✅ Saudável"}</p>
              <p><strong>Local:</strong> {animalSelecionado.Endereco}</p>
              <p><strong>Reportado em:</strong> {animalSelecionado.dataCadastro}</p>
              {animalSelecionado.Descricao && (
                <p><strong>Descrição:</strong> {animalSelecionado.Descricao}</p>
              )}
            </div>

            <CommunicationSection>
              <CommunicationTitle>
                <FaComments />
                Comunicação com a ONG
              </CommunicationTitle>

              {animalSelecionado.Em_Atendimento ? (
                <>
                  <MessageInput
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    placeholder="Digite sua mensagem para a ONG..."
                  />
                  <Button onClick={enviarMensagem} disabled={!novaMensagem.trim()}>
                    Enviar Mensagem
                  </Button>

                  {mensagens.length > 0 ? (
                    <MessagesList>
                      {mensagens.map((msg, index) => (
                        <MessageItem key={index}>
                          <MessageHeader>
                            <MessageAuthor isUser={msg.tipo === "usuario"}>
                              {msg.enviadoPor}
                            </MessageAuthor>
                            <MessageTime>
                              {new Date(msg.data).toLocaleString()}
                            </MessageTime>
                          </MessageHeader>
                          <MessageText>{msg.texto}</MessageText>
                        </MessageItem>
                      ))}
                    </MessagesList>
                  ) : (
                    <Alert type="info">
                      Nenhuma mensagem ainda. Envie a primeira mensagem!
                    </Alert>
                  )}
                </>
              ) : animalSelecionado.finalizado ? (
                <>
                  <Alert type="success">
                    <FaCheckSquare style={{ marginRight: theme.spacing.sm }} />
                    Atendimento concluído com sucesso!
                  </Alert>
                  {mensagens.length > 0 && (
                    <MessagesList>
                      {mensagens.map((msg, index) => (
                        <MessageItem key={index}>
                          <MessageHeader>
                            <MessageAuthor isUser={msg.tipo === "usuario"}>
                              {msg.enviadoPor}
                            </MessageAuthor>
                            <MessageTime>
                              {new Date(msg.data).toLocaleString()}
                            </MessageTime>
                          </MessageHeader>
                          <MessageText>{msg.texto}</MessageText>
                        </MessageItem>
                      ))}
                    </MessagesList>
                  )}
                </>
              ) : (
                <Alert type="warning">
                  <FaExclamationTriangle style={{ marginRight: theme.spacing.sm }} />
                  Este animal ainda não está sendo atendido por uma ONG.
                </Alert>
              )}
            </CommunicationSection>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default Dashboard;