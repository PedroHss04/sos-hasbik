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
    axios
      .get(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
      )
      .then((res) => {
        const estadosOrdenados = res.data.map((estado) => estado.sigla); // apenas sigla
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

    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((resEstados) => {
        const estadoEncontrado = resEstados.data.find(
          (e) => e.sigla === form.estado
        );
        if (estadoEncontrado) {
          return axios.get(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoEncontrado.id}/municipios`
          );
        } else {
          throw new Error("Estado não encontrado.");
        }
      })
      .then((resCidades) => {
        const listaCidades = resCidades.data.map((cidade) => cidade.nome);
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
      setArquivoZip(file);
      setNomeArquivoZip(file.name);
    } else {
      setArquivoZip(null);
      setNomeArquivoZip("");
    }
  };

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
      setErrors((prev) => ({
        ...prev,
        arquivo_zip: "Por favor, selecione um arquivo ZIP.",
      }));
      setIsSubmitting(false);
      return;
    }

    try {
      const validatedData = cadastroEmpresaSchema.parse(form);

      const empresaData = {
        ...validatedData,
        senha_hash: hashPassword(validatedData.senha),
        aprovacao: "pendente",
      };
      delete empresaData.senha;

      // Define o caminho da pasta no bucket
      const caminhoPasta = `pendente/${validatedData.cnpj}/`;

      // Upload do arquivo ZIP para o bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(`${caminhoPasta}${arquivoZip.name}`, arquivoZip);

      if (uploadError) {
        throw new Error(`Erro ao enviar arquivo: ${uploadError.message}`);
      }

      const arquivoUrl = `${supabase.supabaseUrl}/storage/v1/object/public/documentos/${caminhoPasta}${arquivoZip.name}`;

      // Salva a URL do arquivo e o caminho da pasta no objeto a ser inserido
      empresaData.arquivo_zip_url = arquivoUrl;
      empresaData.pasta_arquivo = caminhoPasta;

      // Inserção no banco e captura do registro criado com o ID
      const { data, error } = await supabase
        .from("empresas")
        .insert([empresaData])
        .select();

      if (error) throw error;

      // Pega o ID da empresa cadastrada corretamente a partir do retorno (data)
      const empresaId = data[0].id;

      const tipoDocumento = "comprovante_endereco"; // ou outro tipo conforme o arquivo enviado

      // Insere o documento relacionado
      const { data: docData, error: docError } = await supabase
        .from("documentos")
        .insert([
          {
            empresa_id: empresaId,
            tipo: tipoDocumento,
            url: arquivoUrl,
            status: "pendente",
            pasta_arquivo: caminhoPasta,
            nome_arquivo: arquivoZip.name, // Stores just the file name
          },
        ]);

      if (docError) throw docError;

      setMensagem({
        texto: "✅ Cadastro realizado com sucesso!",
        tipo: "sucesso",
      });
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
        const validationErrors = {};
        error.errors.forEach((err) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setMensagem({
          texto: "❌ Erro no cadastro: " + error.message,
          tipo: "erro",
        });
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
            options={estados}
            value={form.estado}
            onChange={handleChange}
            error={errors.estado}
            required
          />
          <SelectGroup
            label="Cidade"
            name="cidade"
            options={cidades}
            value={form.cidade}
            onChange={handleChange}
            error={errors.cidade}
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
            <FileLabel htmlFor="arquivoZip">
              <FaFileUpload />
              {nomeArquivoZip || "Selecione o arquivo ZIP"}
            </FileLabel>
            <FileInput
              id="arquivoZip"
              type="file"
              accept=".zip"
              onChange={handleArquivoChange}
              ref={fileInputRef}
              required
            />
            {errors.arquivo_zip && (
              <div style={{ color: "red", fontSize: "0.875rem" }}>
                {errors.arquivo_zip}
              </div>
            )}
          </FileInputWrapper>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Cadastrar"}
          </Button>
        </form>
      </FormWrapper>
    </Container>
  );
};

export default CadastroEmpresa;
