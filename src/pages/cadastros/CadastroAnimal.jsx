import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaArrowLeft, FaCheck, FaTimes, FaPaw } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import { z } from "zod";

// Schema de validação
const animalSchema = z.object({
  especie: z.string().min(2, "Espécie deve ter pelo menos 2 caracteres"),
  idade: z.string().nonempty("Selecione a idade"),
  ferido: z.boolean({
    required_error: "Selecione se o animal está ferido",
    invalid_type_error: "Selecione Sim ou Não"
  }),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  descricao: z.string().optional(),
  data: z.string().nonempty("Selecione a data"),
  horario: z.string().nonempty("Selecione o horário")
});

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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa o erro quando o usuário digitar
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleToggle = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    setErrors({});

    try {
      // Validação dos dados
      const validatedData = animalSchema.parse(formData);
      
      // Obter usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Inserir no Supabase
      const { error } = await supabase
        .from('animais')
        .insert([{
          ...validatedData,
          user_id: user.id
        }]);

      if (error) throw error;

      // Feedback de sucesso
      setMessage({ 
        text: "Animal cadastrado com sucesso!", 
        type: "success" 
      });
      
      // Limpar formulário após 2 segundos
      setTimeout(() => {
        setFormData({
          especie: "",
          idade: "",
          ferido: null,
          descricao: "",
          endereco: "",
          data: "",
          horario: ""
        });
      }, 2000);

    } catch (error) {
      console.error("Erro no cadastro:", error);
      
      if (error instanceof z.ZodError) {
        // Tratar erros de validação
        const validationErrors = {};
        error.errors.forEach(err => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        // Erros do Supabase ou outros
        setMessage({ 
          text: error.message || "Erro ao cadastrar animal", 
          type: "error" 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Mensagem de feedback */}
      {message.text && (
        <div style={{
          color: message.type === "success" ? "#38A169" : "#E53E3E",
          margin: "1rem 0",
          padding: "0.5rem",
          textAlign: "center",
          fontWeight: "500"
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Section>
          <Label>Data e horário</Label>
          <Grid>
            <div>
              <Input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleChange}
                style={{
                  borderColor: errors.data ? "#E53E3E" : "#E2E8F0"
                }}
                required
              />
              {errors.data && (
                <span style={{
                  color: "#E53E3E",
                  fontSize: "0.8rem",
                  marginTop: "0.5rem",
                  display: "block"
                }}>
                  {errors.data}
                </span>
              )}
            </div>
            <div>
              <Input
                type="time"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                style={{
                  borderColor: errors.horario ? "#E53E3E" : "#E2E8F0"
                }}
                required
              />
              {errors.horario && (
                <span style={{
                  color: "#E53E3E",
                  fontSize: "0.8rem",
                  marginTop: "0.5rem",
                  display: "block"
                }}>
                  {errors.horario}
                </span>
              )}
            </div>
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
            style={{
              borderColor: errors.especie ? "#E53E3E" : "#E2E8F0"
            }}
            required
          />
          {errors.especie && (
            <span style={{
              color: "#E53E3E",
              fontSize: "0.8rem",
              marginTop: "0.5rem",
              display: "block"
            }}>
              {errors.especie}
            </span>
          )}
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
          {errors.idade && (
            <span style={{
              color: "#E53E3E",
              fontSize: "0.8rem",
              marginTop: "0.5rem",
              display: "block"
            }}>
              {errors.idade}
            </span>
          )}
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
          {errors.ferido && (
            <span style={{
              color: "#E53E3E",
              fontSize: "0.8rem",
              marginTop: "0.5rem",
              display: "block"
            }}>
              {errors.ferido}
            </span>
          )}
        </Section>

        <Section>
          <Label>Endereço onde foi encontrado *</Label>
          <Input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Digite o endereço completo"
            style={{
              borderColor: errors.endereco ? "#E53E3E" : "#E2E8F0"
            }}
            required
          />
          {errors.endereco && (
            <span style={{
              color: "#E53E3E",
              fontSize: "0.8rem",
              marginTop: "0.5rem",
              display: "block"
            }}>
              {errors.endereco}
            </span>
          )}
        </Section>

        <Section>
          <Label>Descrição/Observações</Label>
          <Textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descreva o animal, suas condições, comportamento, etc."
            style={{
              borderColor: errors.descricao ? "#E53E3E" : "#E2E8F0"
            }}
          />
          {errors.descricao && (
            <span style={{
              color: "#E53E3E",
              fontSize: "0.8rem",
              marginTop: "0.5rem",
              display: "block"
            }}>
              {errors.descricao}
            </span>
          )}
        </Section>

        <SubmitButton type="submit" disabled={isSubmitting}>
          <FaPaw />
          {isSubmitting ? "Cadastrando..." : "Cadastrar Animal"}
        </SubmitButton>
      </form>
    </Container>
  );
}
