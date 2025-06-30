import { React, useState } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import FormGroup from "../../geral-components/FormGroup";
import { Button } from "../../geral-components/Button";
import { Mensagem } from "./components/Mensagem";
import { supabase } from "../../lib/supabaseClient";
import { hashPassword } from "../../utils/passwordUtils";
import { loginSchema } from "../../utils/validationSchemas";

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
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const LinkContainer = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: #4f46e5;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [carregando, setCarregando] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem({ texto: "", tipo: "" });
    setErrors({});

    try {
      // Validação com Zod
      const validatedData = loginSchema.parse(form);

      console.log("Tentando login com:", { email: validatedData.email });
      const senhaHash = hashPassword(validatedData.senha);
      console.log("Hash da senha gerado");

      // Primeiro, tenta fazer login como cidadão
      console.log("Buscando usuário...");
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", validatedData.email.trim())
        .eq("senha_hash", senhaHash)
        .maybeSingle();

      console.log("Resposta da busca de usuário:", {
        usuarioData,
        usuarioError,
      });

      if (usuarioError) {
        console.error("Erro ao buscar usuário:", usuarioError);
        throw usuarioError;
      }

      if (usuarioData) {
        console.log("Usuário encontrado:", usuarioData);
        localStorage.setItem("user", JSON.stringify(usuarioData));
        localStorage.setItem("userType", usuarioData.tipoUsuario);
        if (usuarioData.tipoUsuario === "admin") {
          navigate("/dashboard_admin");
        } else if (usuarioData.tipoUsuario === "cidadao") {
          navigate("/dashboard");
        } else if (usuarioData.tipoUsuario === "funcionario") {
          navigate("/dashboard_funcionario");
        } else {
          // Caso tipo inesperado
          setMensagem({
            texto: "Tipo de usuário não reconhecido",
            tipo: "erro",
          });
        }
        return;
      }

      // Se não encontrou como cidadão, tenta como empresa
      console.log("Buscando empresa...");
      const { data: empresaData, error: empresaError } = await supabase
        .from("empresas")
        .select("*")
        .eq("email", validatedData.email.trim())
        .eq("senha_hash", senhaHash)
        .maybeSingle();

      console.log("Resposta da busca de empresa:", {
        empresaData,
        empresaError,
      });

      if (empresaError) {
        console.error("Erro ao buscar empresa:", empresaError);
        throw empresaError;
      }

      if (empresaData) {
        console.log("Empresa encontrada:", empresaData);
        localStorage.setItem("user", JSON.stringify(empresaData));
        localStorage.setItem("userType", "empresa");
        navigate("/dashboard_empresa");
        return;
      }

      setMensagem({
        texto: "❌ Email ou senha inválidos",
        tipo: "erro",
      });
    } catch (error) {
      console.error("Erro detalhado:", error);

      if (error.errors) {
        // Erro de validação do Zod
        const validationErrors = {};
        error.errors.forEach((err) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setMensagem({
          texto: `⚠️ Erro ao fazer login: ${
            error.message || "Erro desconhecido"
          }`,
          tipo: "erro",
        });
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleEmailChange = (e) => {
    setForm((prev) => ({ ...prev, email: e.target.value }));
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleSenhaChange = (e) => {
    setForm((prev) => ({ ...prev, senha: e.target.value }));
    if (errors.senha) {
      setErrors((prev) => ({ ...prev, senha: undefined }));
    }
  };

  return (
    <Container>
      <FormWrapper>
        <Header>
          <Title>Login</Title>
        </Header>
        {mensagem.texto && (
          <Mensagem tipo={mensagem.tipo}>{mensagem.texto}</Mensagem>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup
            label="Email"
            name="email"
            type="email"
            placeholder="Seu email"
            value={form.email}
            onChange={handleEmailChange}
            required
            error={errors.email}
          />
          <FormGroup
            label="Senha"
            name="senha"
            type="password"
            placeholder="Sua senha"
            value={form.senha}
            onChange={handleSenhaChange}
            required
            error={errors.senha}
          />
          <Button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <LinkContainer>
          <StyledLink to="/cadastro_cidadao">Cadastrar como Cidadão</StyledLink>
          {" | "}
          <StyledLink to="/cadastro_empresa">Cadastrar como Empresa</StyledLink>
        </LinkContainer>
      </FormWrapper>
    </Container>
  );
}
