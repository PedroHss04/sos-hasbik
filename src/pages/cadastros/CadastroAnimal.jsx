import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaArrowLeft, FaCheck, FaTimes, FaPaw } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import { z } from "zod";
import { theme } from "../../styles/theme";
import { Container, Card } from "../../components/ui/Layout";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { FormGroup, FormRow } from "../../components/ui/FormComponents";
import { Alert } from "../../components/ui/Alert";

const animalSchema = z.object({
  Especie: z.string().min(2, "Espécie deve ter pelo menos 2 caracteres"),
  Idade: z.string().nonempty("Selecione a idade"),
  Ferido: z.boolean({
    required_error: "Selecione se o animal está ferido",
    invalid_type_error: "Selecione Sim ou Não",
  }),
  Endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  Descricao: z.string().optional(),
  Timestamp: z.string().optional(),
  Id_Usuario: z.string().uuid(),
});

const PageContainer = styled(Container)`
  min-height: 100vh;
  background: ${theme.gradients.background};
  padding: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormCard = styled(Card)`
  width: 100%;
  max-width: 800px;
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  background: ${theme.colors.primary[600]};
  border-radius: ${theme.borderRadius.lg};
  color: white;
  position: relative;
`;

const BackButton = styled(Button)`
  position: absolute;
  left: ${theme.spacing.lg};
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

const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.gray[800]};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  margin-bottom: ${theme.spacing.lg};
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  border: 2px solid ${props => 
    props.selected 
      ? props.variant === 'danger' 
        ? theme.colors.danger[500] 
        : theme.colors.success[500]
      : theme.colors.gray[300]
  };
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => 
    props.selected 
      ? props.variant === 'danger' 
        ? theme.colors.danger[500] 
        : theme.colors.success[500]
      : theme.colors.white
  };
  color: ${props => 
    props.selected 
      ? theme.colors.white
      : theme.colors.gray[600]
  };

  &:hover {
    background: ${props => 
      props.selected 
        ? props.variant === 'danger' 
          ? theme.colors.danger[600] 
          : theme.colors.success[600]
        : theme.colors.gray[50]
    };
    border-color: ${props => 
      props.selected 
        ? props.variant === 'danger' 
          ? theme.colors.danger[600] 
          : theme.colors.success[600]
        : theme.colors.gray[400]
    };
  }
`;

const UrgencyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.warning[100]};
  color: ${theme.colors.warning[800]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.xs};
  font-weight: 500;
  margin-left: auto;
`;

export default function CadastroAnimal() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    especie: "",
    idade: "",
    ferido: null,
    descricao: "",
    endereco: "",
    data: "",
    horario: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData?.id) {
      navigate("/login");
    }
  }, [navigate]);

  const handleBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleToggle = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    setErrors({});

    try {
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!userData?.id) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      try {
        animalSchema.parse({
          Especie: formData.especie,
          Idade: formData.idade,
          Ferido: formData.ferido,
          Endereco: formData.endereco,
          Descricao: formData.descricao,
          Timestamp: new Date().toISOString(),
          Id_Usuario: userData.id,
        });
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          const fieldErrors = {};
          validationError.errors.forEach((err) => {
            fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
          throw new Error("Todos os campos com '*' precisam estar preenchidos");
        }
        throw validationError;
      }

      const { data, error } = await supabase
        .from("Animais")
        .insert([
          {
            Especie: formData.especie,
            Idade: formData.idade,
            Ferido: formData.ferido,
            Endereco: formData.endereco,
            Descricao: formData.descricao,
            Timestamp: new Date().toISOString(),
            Id_Usuario: userData.id,
            finalizado: false,
          },
        ])
        .select();

      if (error) throw error;

      setMessage({
        text: "Animal cadastrado com sucesso! Uma ONG será notificada em breve.",
        type: "success",
      });

      setFormData({
        especie: "",
        idade: "",
        ferido: null,
        descricao: "",
        endereco: "",
        data: "",
        horario: "",
      });
    } catch (error) {
      console.error("Erro completo:", error);
      setMessage({
        text: error.message || "Erro ao cadastrar animal",
        type: "error",
      });

      if (error.message.includes("Sessão expirada")) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <FormCard>
        <Header>
          <BackButton variant="ghost" onClick={handleBack}>
            <FaArrowLeft />
          </BackButton>
          <Title>
            <FaPaw />
            Reportar Animal
            {formData.ferido === true && (
              <UrgencyBadge>
                🚨 Urgente
              </UrgencyBadge>
            )}
          </Title>
        </Header>

        {message.text && (
          <Alert type={message.type} style={{ marginBottom: theme.spacing.lg }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>📅 Quando você encontrou o animal?</SectionTitle>
            <FormRow>
              <FormGroup>
                <Input
                  label="Data"
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Input
                  label="Horário"
                  type="time"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </FormRow>
          </Section>

          <Section>
            <SectionTitle>🐾 Informações do Animal</SectionTitle>
            <FormGroup>
              <Input
                label="Que tipo de animal é?"
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                error={errors.Especie}
                required
                placeholder="Ex: Cachorro, Gato, Pássaro, Tartaruga..."
              />
            </FormGroup>

            <FormGroup>
              <label style={{ 
                fontWeight: 600,
                color: theme.colors.gray[700],
                marginBottom: theme.spacing.sm,
                display: 'block'
              }}>
                Qual a idade aproximada? *
              </label>
              <ToggleGroup>
                {["Filhote", "Jovem", "Adulto", "Não sei"].map((item) => (
                  <ToggleButton
                    key={item}
                    type="button"
                    selected={formData.idade === item}
                    onClick={() => handleToggle("idade", item)}
                  >
                    {item}
                  </ToggleButton>
                ))}
              </ToggleGroup>
            </FormGroup>

            <FormGroup>
              <label style={{ 
                fontWeight: 600,
                color: theme.colors.gray[700],
                marginBottom: theme.spacing.sm,
                display: 'block'
              }}>
                O animal está ferido ou machucado? *
              </label>
              <ToggleGroup>
                <ToggleButton
                  type="button"
                  selected={formData.ferido === true}
                  variant="danger"
                  onClick={() => handleToggle("ferido", true)}
                >
                  <FaTimes /> Sim, está ferido
                </ToggleButton>
                <ToggleButton
                  type="button"
                  selected={formData.ferido === false}
                  onClick={() => handleToggle("ferido", false)}
                >
                  <FaCheck /> Não, parece saudável
                </ToggleButton>
              </ToggleGroup>
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>📍 Localização</SectionTitle>
            <FormGroup>
              <Input
                label="Onde você encontrou o animal?"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                error={errors.Endereco}
                required
                placeholder="Digite o endereço completo ou ponto de referência"
              />
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>📝 Detalhes Adicionais</SectionTitle>
            <FormGroup>
              <Textarea
                label="Descreva o animal e a situação"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Ex: Cachorro pequeno, cor marrom, muito assustado, estava próximo ao parque..."
                rows={4}
              />
            </FormGroup>
          </Section>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            loading={isSubmitting}
            variant={formData.ferido === true ? "danger" : "primary"}
            style={{ width: '100%', marginTop: theme.spacing.lg }}
          >
            <FaPaw />
            {isSubmitting 
              ? "Enviando..." 
              : formData.ferido === true 
                ? "🚨 Reportar Emergência" 
                : "Reportar Animal"
            }
          </Button>
        </form>
      </FormCard>
    </PageContainer>
  );
}