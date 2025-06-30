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
} from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import DetalhesAnimal from "../detalhesAnimal/DetalhesAnimal";
import { FaCheckDouble } from "react-icons/fa6";

const Container = styled.div`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  margin-bottom: 2rem;
  background-color: #4f46e5;
  border-radius: 10px;
  color: white;
  position: relative;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
`;

const ButtonGroup = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
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

const AnimalsList = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const AnimalCard = styled.div`
  padding: 1.2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9fafb;
  }
`;

const AnimalInfo = styled.div`
  flex: 1;
`;

const AnimalName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #1e293b;
`;

const AnimalDetails = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: ${(props) =>
    props.status === "Em Atendimento"
      ? "#3b82f6"
      : props.status === "Finalizado"
      ? "#4F46E5"
      : "#10b981"};
  color: white;
  margin-left: 1rem;
`;

const FooterButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  background: ${(props) => (props.primary ? "#4f46e5" : "#10b981")};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.primary ? "#4338ca" : "#059669")};
    transform: translateY(-2px);
  }
`;

// Estilos para a comunicação
const ComunicacaoContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ComunicacaoTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MensagemInput = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 0.5rem;
`;

const EnviarButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const MensagensList = styled.div`
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
`;

const MensagemItem = styled.div`
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("");
  const [animals, setAnimals] = useState([]);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");

    if (!storedUser || storedUserType !== "cidadao") {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setUserType(storedUserType);

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

  // Carrega as mensagens quando um animal é selecionado
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

    // --- INÍCIO DA ADIÇÃO PARA REALTIME ---
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
                // Opcional: Atualizar o animalSelecionado para refletir a mudança na lista de animais
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
    // --- FIM DA ADIÇÃO PARA REALTIME ---
  }, [animalSelecionado]); // Dependência: animalSelecionado

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const handleRegisterAnimal = () => {
    navigate("/cadastro_animal");
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

      // A atualização do estado local do animal selecionado e da lista de animais
      // será tratada pelo listener de realtime agora.
      // setAnimalSelecionado((prev) => ({
      //   ...prev,
      //   mensagens_empresa: mensagensString,
      // }));
      // setAnimals(
      //   animals.map((animal) =>
      //     animal.id === animalSelecionado.id ? { ...animal, mensagens_empresa: mensagensString } : animal
      //   )
      // );

      setNovaMensagem("");
      // alert("Mensagem enviada com sucesso!"); // Remova este alert para uma experiência mais fluida
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  if (!user) return null;

  return (
    <Container>
      <Header>
        <Title>Minha Dashboard</Title>
        <ButtonGroup>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt />
            Sair
          </LogoutButton>
        </ButtonGroup>
      </Header>

      <AnimalsList>
        <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#1e293b" }}>
          <FaPaw style={{ marginRight: "0.5rem" }} />
          Meus Animais Cadastrados
        </h2>

        {animals.length > 0 ? (
          animals.map((animal) => (
            <AnimalCard
              key={animal.id}
              onClick={() => setAnimalSelecionado(animal)}
            >
              <AnimalInfo>
                <AnimalName>
                  {animal.nome}
                  {animal.Em_Atendimento && (
                    <StatusBadge status="Em Atendimento">
                      Em Atendimento
                    </StatusBadge>
                  )}
                  {animal.finalizado && (
                    <StatusBadge status="Finalizado">
                      Atendimento finalizado
                    </StatusBadge>
                  )}
                </AnimalName>
                <AnimalDetails>
                  {animal.Especie} • {animal.Idade} • {animal.Descricao} •
                  Cadastrado em: {animal.dataCadastro}
                </AnimalDetails>
              </AnimalInfo>
            </AnimalCard>
          ))
        ) : (
          <p style={{ color: "#64748b", textAlign: "center" }}>
            Nenhum animal cadastrado ainda.
          </p>
        )}
      </AnimalsList>

      <FooterButtons>
        <ActionButton
          primary
          onClick={() => alert("Funcionalidade em desenvolvimento")}
        >
          <FaPaw />
          Ver Todos
        </ActionButton>
        <ActionButton onClick={handleRegisterAnimal}>
          <FaPlus />
          Cadastrar Animal
        </ActionButton>
      </FooterButtons>

      {animalSelecionado && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "10px",
              width: "80%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3>{animalSelecionado.nome}</h3>

            <div style={{ margin: "1rem 0" }}>
              <p>
                <strong>Espécie:</strong> {animalSelecionado.Especie}
              </p>
              <p>
                <strong>Idade:</strong> {animalSelecionado.Idade}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                {animalSelecionado.Ferido ? "Ferido" : "Saudável"}
              </p>
              <p>
                <strong>Cadastrado em:</strong> {animalSelecionado.dataCadastro}
              </p>
              <p>
                <strong>Descrição:</strong> {animalSelecionado.Descricao}
              </p>
            </div>

            {/* Seção de Comunicação */}
            <ComunicacaoContainer>
              <ComunicacaoTitle>
                <FaComments /> Comunicação com a Empresa
              </ComunicacaoTitle>

              {animalSelecionado.Em_Atendimento ? (
                <>
                  <MensagemInput
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    placeholder="Digite sua mensagem para a empresa..."
                  />
                  <EnviarButton onClick={enviarMensagem}>
                    Enviar Mensagem
                  </EnviarButton>

                  {mensagens.length > 0 ? (
                    <MensagensList>
                      {mensagens.map((msg, index) => (
                        <MensagemItem key={index}>
                          <div>
                            <strong>{msg.enviadoPor}:</strong> {msg.texto}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                            {new Date(msg.data).toLocaleString()}
                          </div>
                        </MensagemItem>
                      ))}
                    </MensagensList>
                  ) : (
                    <p style={{ color: "#64748b", textAlign: "center" }}>
                      Nenhuma mensagem ainda. Envie a primeira mensagem!
                    </p>
                  )}
                </>
              ) : animalSelecionado.finalizado ? (
                <>
                  <p style={{ color: "#64748b", textAlign: "center" }}>
                    <FaCheckSquare style={{ marginRight: "0.5rem" }} />
                    Atendimento concluído.
                  </p>
                  <MensagensList>
                    {mensagens.map((msg, index) => (
                      <MensagemItem key={index}>
                        <div>
                          <strong>{msg.enviadoPor}:</strong> {msg.texto}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {new Date(msg.data).toLocaleString()}
                        </div>
                      </MensagemItem>
                    ))}
                  </MensagensList>
                </>
              ) : (
                <p style={{ color: "#64748b", textAlign: "center" }}>
                  <FaExclamationTriangle style={{ marginRight: "0.5rem" }} />
                  Esta ocorrência ainda não está em atendimento por uma empresa.
                </p>
              )}
            </ComunicacaoContainer>

            <button
              onClick={() => setAnimalSelecionado(null)}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Dashboard;
