import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaArrowLeft, FaCheck, FaTimes, FaPaw } from "react-icons/fa";

// Styled Components
const Container = styled.div`
  padding: 2rem;
  border-radius: 15px;
  background-color: #f8fafc;
  max-width: 800px;
  margin: 2rem auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 2rem;
  background-color: #2B6CB0; /*VER AQUI */
  border-radius: 10px;
  color: white;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 1rem;
  transition: transform 0.2s;
  display: flex;
  align-items: center;

  &:hover {
    transform: translateX(-3px);
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  flex-grow: 1;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 600;
  color: #334155;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 100%;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }
`;

const Textarea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 100%;
  height: 120px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.columns || "1fr 1fr"};
  gap: 1.5rem;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const StatusButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(props) =>
    props.selected
      ? props.variant === "success"
        ? "#10b981"
        : "#ef4444"
      : "#f1f5f9"};
  color: ${(props) => (props.selected ? "white" : "#64748b")};
  border: 1px solid ${(props) =>
    props.selected
      ? props.variant === "success"
        ? "#10b981"
        : "#ef4444"
      : "#cbd5e1"};

  &:hover {
    background-color: ${(props) =>
      props.selected
        ? props.variant === "success"
          ? "#059669"
          : "#dc2626"
        : "#e2e8f0"};
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background-color: #38A169;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;

  &:hover {
    background-color: #2F855A;
  }
`;

// Main Component
export default function CadastroAnimal() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    especie: "",
    idade: "",
    ferido: null,
    descricao: "",
    endereco: "",
    data: "",
    horario: ""
  });

  const handleBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados do animal:", formData);
    // Aqui você faria a chamada para sua API/Supabase
    alert("Animal cadastrado com sucesso!");
    navigate("/dashboard");
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
        </BackButton>
        <Title>Cadastro do Animal</Title>
        <div style={{ width: "32px" }}></div>
      </Header>

      <form onSubmit={handleSubmit}>
        <Section>
          <Label>Data e horário</Label>
          <Grid>
            <Input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
            />
            <Input
              type="time"
              name="horario"
              value={formData.horario}
              onChange={handleChange}
              required
            />
          </Grid>
        </Section>

        <Section>
          <Label>Espécie *</Label>
          <Input
            type="text"
            name="especie"
            value={formData.especie}
            onChange={handleChange}
            placeholder="Ex: Cachorro, Gato, Pássaro, Tartaruga..."
            required
          />
        </Section>

        <Section>
          <Label>Idade *</Label>
          <ToggleGroup>
            {["Filhote", "Jovem", "Adulto", "Não sei"].map((item) => (
              <StatusButton
                key={item}
                type="button"
                selected={formData.idade === item}
                variant={formData.idade === item ? "success" : null}
                onClick={() => handleToggle("idade", item)}
              >
                {item}
              </StatusButton>
            ))}
          </ToggleGroup>
        </Section>

        <Section>
          <Label>O animal está ferido? *</Label>
          <ToggleGroup>
            <StatusButton
              type="button"
              selected={formData.ferido === true}
              variant={formData.ferido === true ? "success" : null}
              onClick={() => handleToggle("ferido", true)}
            >
              <FaCheck /> Sim
            </StatusButton>
            <StatusButton
              type="button"
              selected={formData.ferido === false}
              variant={formData.ferido === false ? "danger" : null}
              onClick={() => handleToggle("ferido", false)}
            >
              <FaTimes /> Não
            </StatusButton>
          </ToggleGroup>
        </Section>

        <Section>
          <Label>Endereço onde foi encontrado *</Label>
          <Input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Digite o endereço completo"
            required
          />
        </Section>

        <Section>
          <Label>Descrição/Observações</Label>
          <Textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descreva o animal, suas condições, comportamento, etc."
          />
        </Section>

        <SubmitButton type="submit">
          <FaPaw /> Cadastrar Animal
        </SubmitButton>
      </form>
    </Container>
  );
}