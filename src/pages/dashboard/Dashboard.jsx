import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaSignOutAlt, FaPlus, FaPaw } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import DetalhesAnimal from "../detalhesAnimal/DetalhesAnimal";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("");
  const [animals, setAnimals] = useState([]);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");

    if (!storedUser || !storedUserType) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setUserType(storedUserType);

    const fetchAnimals = async () => {
      const userId = parsedUser.id; // Obter o ID do usuário logado
      const { data, error } = await supabase
        .from("Animais")
        .select("*")
        .eq("Id_Usuario", userId)  // Usando o ID do usuário logado
        .order("Timestamp", { ascending: false });

      if (error) {
        console.error("Erro ao buscar animais:", error);
        return;
      }

      const formattedData = data.map((animal) => ({
        ...animal,
        nome: animal.Especie, // ou use 'Nome' se esse campo existir na tabela
        dataCadastro: new Date(animal.Timestamp).toLocaleDateString("pt-BR"),
        idade: animal.Idade,
        descricao: animal.Descricao
        

      }));

      setAnimals(formattedData);
    };

    fetchAnimals();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const handleRegisterAnimal = () => {
    navigate("/cadastro_animal");
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
              onClick={() => setAnimalSelecionado(animal)} // Ao clicar, abre o modal
            >
              <AnimalInfo>
                <AnimalName>{animal.nome}</AnimalName>
                <AnimalDetails>
                  {animal.Especie} • {animal.Idade} • {animal.Descricao} • Cadastrado em:{" "}
                  {animal.dataCadastro}
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
        <ActionButton primary onClick={() => alert("Funcionalidade em desenvolvimento")}>
          <FaPaw />
          Ver Todos
        </ActionButton>
        <ActionButton onClick={handleRegisterAnimal}>
          <FaPlus />
          Cadastrar Animal
        </ActionButton>
      </FooterButtons>

      {animalSelecionado && (
        <DetalhesAnimal
          animal={animalSelecionado}
          onClose={() => setAnimalSelecionado(null)} // Fecha o modal
        />
      )}
    </Container>
  );
};

export default Dashboard;
