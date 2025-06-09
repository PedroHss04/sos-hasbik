import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FormGroup from "../../geral-components/FormGroup";
import SelectGroup from "./components/SelectGroup";
import { Button } from "../../geral-components/Button";
import { FaBuilding, FaArrowLeft } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import { hashPassword } from "../../utils/passwordUtils";
import { cadastroEmpresaSchema } from "../../utils/validationSchemas";

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
  max-width: 500px;
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

const CompanyIcon = styled(FaBuilding)`
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


const CadastroEmpresa = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [errors, setErrors] = useState({});
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    estado: "",
    cidade: "",
    cep: "",
    endereco: "",
    senha: ""
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

  const formatarCNPJ = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const formatarCEP = (valor) => {
    return valor
      .replace(/\D/g, "") // remove tudo que não for número
      .slice(0, 8)        // limita até 8 dígitos
      .replace(/^(\d{5})(\d)/, "$1-$2"); // coloca o hífen depois dos 5 primeiros dígitos
  };
  

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 10) {
      return numeros.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return numeros.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === "cnpj") {
      novoValor = formatarCNPJ(value);
    }

    if (name === "telefone") {
      novoValor = formatarTelefone(value);
    }

    if (name === "cep") {
      novoValor = formatarCEP(value);
    }
    

    setForm(prev => ({ ...prev, [name]: novoValor }));

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
      
      const formSemMascara = {
        ...form,
        cnpj: form.cnpj.replace(/\D/g, ""),
        telefone: form.telefone.replace(/\D/g, ""),
        cep: form.cep.replace(/\D/g, "")
      };
  
     
      const validatedData = cadastroEmpresaSchema.parse(formSemMascara);
  
      const empresaData = {
        ...validatedData,
        senha_hash: hashPassword(validatedData.senha),
        aprovacao: "pendente"
      };
      delete empresaData.senha;
  
      const { error } = await supabase.from("empresas").insert([empresaData]);
  
      if (error) throw error;
  
      setMensagem({ texto: "✅ Cadastro realizado com sucesso! Aguarde a aprovação.", tipo: "sucesso" });
      event.target.reset();
      setForm({
        nome: "",
        cnpj: "",
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
          <Title>Cadastro de Empresa</Title>
          <CompanyIcon />
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
            label="Nome da Empresa"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            error={errors.nome}
            required
          />
          <FormGroup
            label="CNPJ"
            name="cnpj"
            value={form.cnpj}
            onChange={handleChange}
            error={errors.cnpj}
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
          <FormGroup
            label="Senha"
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            error={errors.senha}
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
            {isSubmitting ? "Cadastrando..." : "Cadastrar Empresa"}
          </Button>
        </form>
      </FormWrapper>
    </Container>
  );
};

export default CadastroEmpresa;
