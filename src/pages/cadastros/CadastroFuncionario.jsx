import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FormGroup from "../../geral-components/FormGroup";
import SelectGroup from "./components/SelectGroup";
import { Button } from "../../geral-components/Button";
import { FaUserPlus, FaArrowLeft } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import { hashPassword } from "../../utils/passwordUtils";
import { cadastroCidadaoSchema } from "../../utils/validationSchemas";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, #f0f2f5, #e1e6e8);
  padding: 2rem;
`;

const FormWrapper = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: #374151;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: #4b5563;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:hover {
    background-color: #374151;
  }
`;

const CadastroFuncionario = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [errors, setErrors] = useState({});
  const [empresaLogada, setEmpresaLogada] = useState(null);
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    estado: "",
    cidade: "",
    cep: "",
    endereco: "",
    senha: "",
  });

  // Buscar estados do Brasil (IBGE)
  useEffect(() => {
    axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((res) => {
        const estadosOrdenados = res.data.map((estado) => estado.sigla);
        setEstados(estadosOrdenados);
      })
      .catch((err) => {
        console.error("Erro ao buscar estados:", err);
      });
  }, []);

  // Buscar cidades com base no estado selecionado
  useEffect(() => {
    if (!form.estado) {
      setCidades([]);
      return;
    }

    // Buscar o ID do estado a partir da sigla
    axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((resEstados) => {
        const estadoEncontrado = resEstados.data.find(e => e.sigla === form.estado);
        if (estadoEncontrado) {
          return axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoEncontrado.id}/municipios`);
        } else {
          throw new Error("Estado não encontrado.");
        }
      })
      .then((resCidades) => {
        const listaCidades = resCidades.data.map(cidade => cidade.nome);
        setCidades(listaCidades);
      })
      .catch((err) => {
        console.error("Erro ao buscar cidades:", err);
        setCidades([]);
      });
  }, [form.estado]);

  useEffect(() => {
    const getEmpresaLogada = async () => {
      const userString = localStorage.getItem("user");

      if (!userString) {
        navigate("/login");
        return;
      }

      let user;
      try {
        user = JSON.parse(userString);
      } catch (err) {
        console.error("Erro ao parsear user do localStorage:", err);
        navigate("/login");
        return;
      }

      if (!user.id) {
        console.error("ID da empresa não encontrado no user");
        navigate("/login");
        return;
      }

      const { data: empresa, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar dados da empresa:", error);
        setMensagem({ texto: "Erro ao carregar dados da empresa.", tipo: "erro" });
        return;
      }

      setEmpresaLogada(empresa);
    };

    getEmpresaLogada();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMensagem({ texto: "", tipo: "" });
    setErrors({});

    if (empresaLogada?.aprovacao !== "aprovada") {
      setMensagem({ texto: "Sua empresa precisa ser aprovada para cadastrar funcionários.", tipo: "alerta" });
      setIsSubmitting(false);
      return;
    }

    try {
      const validatedData = cadastroCidadaoSchema.parse(form);

      const funcionarioData = {
        ...validatedData,
        senha_hash: hashPassword(validatedData.senha),
        tipoUsuario: "funcionario",
        empresa_id: empresaLogada.id,
      };
      delete funcionarioData.senha;

      const { data, error } = await supabase
        .from("usuarios")
        .insert([funcionarioData])
        .select();

      if (error) throw error;

      setMensagem({ texto: "✅ Funcionário cadastrado com sucesso!", tipo: "sucesso" });
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
        senha: "",
      });
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error);

      if (error.errors) {
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

  if (!empresaLogada) {
    return (
      <Container>
        <FormWrapper>
          <BackButton onClick={() => navigate("/dashboard-empresa")}>
            <FaArrowLeft />
            Voltar para o Dashboard
          </BackButton>
          <Title>Cadastro de Funcionário</Title>
          {mensagem.texto && (
            <div
              style={{
                color: mensagem.tipo === "sucesso" ? "green" : "red",
                marginBottom: "1rem",
              }}
            >
              {mensagem.texto}
            </div>
          )}
          <p>Carregando dados da empresa...</p>
        </FormWrapper>
      </Container>
    );
  }

  if (empresaLogada.aprovacao !== "aprovada") {
    return (
      <Container>
        <FormWrapper>
          <BackButton onClick={() => navigate("/dashboard-empresa")}>
            <FaArrowLeft />
            Voltar para o Dashboard
          </BackButton>
          <Title>Cadastro de Funcionário</Title>
          {mensagem.texto && (
            <div
              style={{
                color: mensagem.tipo === "sucesso" ? "green" : "red",
                marginBottom: "1rem",
              }}
            >
              {mensagem.texto}
            </div>
          )}
          <p>Sua empresa precisa ser aprovada para cadastrar funcionários.</p>
        </FormWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <FormWrapper>
        <BackButton onClick={() => navigate("/dashboard_empresa")}>
          <FaArrowLeft />
          Voltar para o Dashboard
        </BackButton>
        <Header>
          <Title>Cadastro de Funcionário</Title>
          <FaUserPlus size={32} color="#4a5568" />
        </Header>
        {mensagem.texto && (
          <div
            style={{
              color: mensagem.tipo === "sucesso" ? "green" : "red",
              marginBottom: "1rem",
            }}
          >
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
            options={estados}
            required
          />
          <SelectGroup
            label="Cidade"
            name="cidade"
            value={form.cidade}
            onChange={handleChange}
            error={errors.cidade}
            options={cidades}
            required
            disabled={!form.estado}
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
            {isSubmitting ? "Cadastrando..." : "Cadastrar Funcionário"}
          </Button>
        </form>
      </FormWrapper>
    </Container>
  );
};

export default CadastroFuncionario;
