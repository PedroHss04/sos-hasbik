import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FormGroup from "../../geral-components/FormGroup";
import SelectGroup from "./components/SelectGroup";
import { Button } from "../../geral-components/Button";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import { hashPassword } from "../../utils/passwordUtils";
import { cadastroCidadaoSchema } from "../../utils/validationSchemas";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, #dfe9f3, #ffffff);
  padding: 2rem;
`;

const FormWrapper = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const AvatarIcon = styled(FaUserCircle)`
  font-size: 32px;
  color: #444;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:hover {
    background: #4b5563;
  }
`;

const CadastroCidadao = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    estado: "",
    cidade: "",
    cep: "",
    endereco: "",
    senha: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMensagem({ texto: "", tipo: "" });
    setErrors({});

    try {
      // Validação com Zod
      const validatedData = cadastroCidadaoSchema.parse(form);
      
      const userData = {
        ...validatedData,
        senha_hash: hashPassword(validatedData.senha),
        tipoUsuario: "comum"
      };
      delete userData.senha; // Remove a senha do objeto antes de enviar

      const { data, error } = await supabase
        .from("usuarios")
        .insert([userData])
        .select();

      if (error) throw error;

      setMensagem({ texto: "✅ Cadastro realizado com sucesso!", tipo: "sucesso" });
      event.target.reset();
      setForm({
        nome: "",
        cpf: "",
        email: "",
        telefone: "",
        estado: "",
        cidade: "",
        cep: "",
        endereco: "",
        senha: ""
      });
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      
      if (error.errors) {
        // Erro de validação do Zod
        const validationErrors = {};
        error.errors.forEach((err) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setMensagem({ texto: "❌ Erro no cadastro: " + error.message, tipo: "erro" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <FormWrapper>
        <BackButton onClick={() => navigate("/login")}>
          <FaArrowLeft />
          Voltar para Login
        </BackButton>
        <Header>
          <Title>Cadastro Cidadão</Title>
          <AvatarIcon />
        </Header>
        {mensagem.texto && (
          <div style={{ 
            color: mensagem.tipo === "sucesso" ? "green" : "red",
            marginBottom: "1rem"
          }}>
            {mensagem.texto}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormGroup 
            label="Nome" 
            name="nome" 
            value={form.nome}
            onChange={handleChange}
            error={errors.nome}
            required 
          />
          <FormGroup 
            label="CPF" 
            name="cpf" 
            value={form.cpf}
            onChange={handleChange}
            error={errors.cpf}
            required 
          />
          <FormGroup 
            label="Senha" 
            name="senha" 
            type="password" 
            value={form.senha}
            onChange={handleChange}
            error={errors.senha}
            required 
          />
          <FormGroup 
            label="Email" 
            name="email" 
            type="email" 
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            required 
          />
          <FormGroup 
            label="Telefone" 
            name="telefone" 
            value={form.telefone}
            onChange={handleChange}
            error={errors.telefone}
            required 
          />

          <SelectGroup
            label="Estado"
            name="estado"
            value={form.estado}
            onChange={handleChange}
            error={errors.estado}
            options={["SP", "RJ", "MG"]}
            required
          />
          <SelectGroup
            label="Cidade"
            name="cidade"
            value={form.cidade}
            onChange={handleChange}
            error={errors.cidade}
            options={["São Paulo", "Rio de Janeiro", "Belo Horizonte"]}
            required
          />

          <FormGroup 
            label="CEP" 
            name="cep" 
            value={form.cep}
            onChange={handleChange}
            error={errors.cep}
            required 
          />
          <FormGroup 
            label="Endereço" 
            name="endereco" 
            value={form.endereco}
            onChange={handleChange}
            error={errors.endereco}
            required 
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
      </FormWrapper>
    </Container>
  );
};

export default CadastroCidadao;
