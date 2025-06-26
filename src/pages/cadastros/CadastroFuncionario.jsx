import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserPlus, FaArrowLeft } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import { hashPassword } from "../../utils/passwordUtils";
import { cadastroCidadaoSchema } from "../../utils/validationSchemas";
import { theme } from "../../styles/theme";
import { Container, Card } from "../../components/ui/Layout";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { FormGroup, FormRow } from "../../components/ui/FormComponents";
import { Alert } from "../../components/ui/Alert";

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
  max-width: 600px;
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  color: ${theme.colors.primary[800]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const BackButton = styled(Button)`
  margin-bottom: ${theme.spacing.lg};
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

  useEffect(() => {
    if (!form.estado) {
      setCidades([]);
      return;
    }

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
        setMensagem({ texto: "Erro ao carregar dados da empresa.", tipo: "error" });
        return;
      }

      setEmpresaLogada(empresa);
    };

    getEmpresaLogada();
  }, [navigate]);

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 10) {
      return numeros.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return numeros.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const formatarCEP = (valor) => {
    return valor
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/^(\d{5})(\d)/, "$1-$2");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === "cpf") {
      novoValor = formatarCPF(value);
    }

    if (name === "telefone") {
      novoValor = formatarTelefone(value);
    }

    if (name === "cep") {
      novoValor = formatarCEP(value);
    }

    setForm((prev) => ({ ...prev, [name]: novoValor }));
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
      setMensagem({ 
        texto: "Sua empresa precisa ser aprovada para cadastrar funcionários.", 
        tipo: "warning" 
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const formSemMascara = {
        ...form,
        cpf: form.cpf.replace(/\D/g, ""),
        telefone: form.telefone.replace(/\D/g, ""),
        cep: form.cep.replace(/\D/g, ""),
      };

      const validatedData = cadastroCidadaoSchema.parse(formSemMascara);

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

      setMensagem({ 
        texto: "✅ Funcionário cadastrado com sucesso!", 
        tipo: "success" 
      });
      
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
        setMensagem({ 
          texto: "❌ Erro no cadastro: " + error.message, 
          tipo: "error" 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!empresaLogada) {
    return (
      <PageContainer>
        <FormCard>
          <BackButton variant="secondary" onClick={() => navigate("/dashboard_empresa")}>
            <FaArrowLeft />
            Voltar para o Dashboard
          </BackButton>
          <Title>Cadastro de Funcionário</Title>
          {mensagem.texto && (
            <Alert type={mensagem.tipo} style={{ marginBottom: theme.spacing.lg }}>
              {mensagem.texto}
            </Alert>
          )}
          <p>Carregando dados da empresa...</p>
        </FormCard>
      </PageContainer>
    );
  }

  if (empresaLogada.aprovacao !== "aprovada") {
    return (
      <PageContainer>
        <FormCard>
          <BackButton variant="secondary" onClick={() => navigate("/dashboard_empresa")}>
            <FaArrowLeft />
            Voltar para o Dashboard
          </BackButton>
          <Title>Cadastro de Funcionário</Title>
          <Alert type="warning" style={{ marginTop: theme.spacing.lg }}>
            Sua empresa precisa ser aprovada para cadastrar funcionários.
          </Alert>
        </FormCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FormCard>
        <BackButton variant="secondary" onClick={() => navigate("/dashboard_empresa")}>
          <FaArrowLeft />
          Voltar para o Dashboard
        </BackButton>

        <Header>
          <Title>
            <FaUserPlus />
            Cadastro de Funcionário
          </Title>
        </Header>

        {mensagem.texto && (
          <Alert type={mensagem.tipo} style={{ marginBottom: theme.spacing.lg }}>
            {mensagem.texto}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              label="Nome Completo"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              error={errors.nome}
              required
              placeholder="Digite o nome completo"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Input
                label="CPF"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                error={errors.cpf}
                required
                placeholder="000.000.000-00"
              />
            </FormGroup>
            <FormGroup>
              <Input
                label="Telefone"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                error={errors.telefone}
                required
                placeholder="(00) 00000-0000"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="funcionario@exemplo.com"
              />
            </FormGroup>
            <FormGroup>
              <Input
                label="Senha"
                name="senha"
                type="password"
                value={form.senha}
                onChange={handleChange}
                error={errors.senha}
                required
                placeholder="Mínimo 6 caracteres"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Select
                label="Estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                error={errors.estado}
                required
              >
                <option value="">Selecione o estado</option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Select
                label="Cidade"
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                error={errors.cidade}
                required
                disabled={!form.estado}
              >
                <option value="">Selecione a cidade</option>
                {cidades.map((cidade) => (
                  <option key={cidade} value={cidade}>
                    {cidade}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Input
                label="CEP"
                name="cep"
                value={form.cep}
                onChange={handleChange}
                error={errors.cep}
                required
                placeholder="00000-000"
              />
            </FormGroup>
            <FormGroup>
              <Input
                label="Endereço"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                error={errors.endereco}
                required
                placeholder="Rua, número, bairro"
              />
            </FormGroup>
          </FormRow>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            loading={isSubmitting}
            style={{ width: '100%', marginTop: theme.spacing.lg }}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Funcionário"}
          </Button>
        </form>
      </FormCard>
    </PageContainer>
  );
};

export default CadastroFuncionario;