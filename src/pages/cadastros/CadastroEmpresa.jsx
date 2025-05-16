import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FormGroup from "../../geral-components/FormGroup";
import SelectGroup from "./components/SelectGroup";
import { Button } from "../../geral-components/Button";
import { FaUserCircle, FaArrowLeft, FaFileUpload } from "react-icons/fa";
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

const FileInputWrapper = styled.div`
  margin-bottom: 1rem;
`;

const FileLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  border: 1px solid #d1d5db;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: #e5e7eb;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileName = styled.span`
  font-size: 0.875rem;
  color: #374151;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
    senha: "",
  });
  const [arquivoZip, setArquivoZip] = useState(null);
  const [nomeArquivoZip, setNomeArquivoZip] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  useEffect(() => {
    axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((res) => {
        const estadosOrdenados = res.data.map((estado) => estado.sigla); // apenas sigla
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

  const handleArquivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Atualiza o estado imediatamente ao selecionar o arquivo
      setArquivoZip(file);
      setNomeArquivoZip(file.name);
    } else {
      setArquivoZip(null);
      setNomeArquivoZip("");
    }
  };

  // useEffect para verificar o tipo de arquivo após a atualização do estado
 useEffect(() => {
  if (arquivoZip && !arquivoZip.name.toLowerCase().endsWith(".zip")) {
    alert("Por favor, selecione um arquivo ZIP.");
    setArquivoZip(null);
    setNomeArquivoZip("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
}, [arquivoZip, fileInputRef]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMensagem({ texto: "", tipo: "" });
    setErrors({});

    if (!arquivoZip) {
      setErrors(prev => ({ ...prev, arquivo_zip: "Por favor, selecione um arquivo ZIP." }));
      setIsSubmitting(false);
      return;
    }

    try {
      // Validação com Zod
      const validatedData = cadastroEmpresaSchema.parse(form);

      const empresaData = {
        ...validatedData,
        senha_hash: hashPassword(validatedData.senha),
        aprovacao: "pendente", // Define o status de aprovação como "pendente"
      };
      delete empresaData.senha; // Remove a senha do objeto antes de enviar

      let arquivoUrl = null;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documentos") // Especifica o bucket "documentos"
        .upload(`pendente/${validatedData.cnpj}/${arquivoZip.name}`, arquivoZip); // Envia para a pasta "pendente"

      if (uploadError) {
        throw new Error(`Erro ao enviar arquivo: ${uploadError.message}`);
      }
      arquivoUrl = `${supabase.supabaseUrl}/storage/v1/object/public/documentos/pendente/${validatedData.cnpj}/${arquivoZip.name}`; // URL correta para o arquivo em "pendente"
      empresaData.arquivo_zip_url = arquivoUrl;

      const { data, error } = await supabase
        .from("empresas")
        .insert([empresaData])
        .select();

      if (error) throw error;

      setMensagem({ texto: "✅ Cadastro realizado com sucesso!", tipo: "sucesso" });
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
        senha: "",
      });
      setArquivoZip(null);
      setNomeArquivoZip("");
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
          <Title>Cadastro Empresa</Title>
          <AvatarIcon />
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
            label="CNPJ"
            name="cnpj"
            value={form.cnpj}
            onChange={handleChange}
            error={errors.cnpj}
            required
          />
          <FormGroup
            label="Nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            error={errors.nome}
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

          <FileInputWrapper>
            <FileLabel htmlFor="arquivo_zip">
              <FaFileUpload />
              {nomeArquivoZip ? <FileName>{nomeArquivoZip}</FileName> : "Selecionar Arquivo ZIP"}
            </FileLabel>
            <FileInput
              type="file"
              id="arquivo_zip"
              accept=".zip"
              onChange={handleArquivoChange}
              ref={fileInputRef}
            />
            {errors.arquivo_zip && (
              <div style={{ color: "red", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {errors.arquivo_zip}
              </div>
            )}
          </FileInputWrapper>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
      </FormWrapper>
    </Container>
  );
};

export default CadastroEmpresa;
