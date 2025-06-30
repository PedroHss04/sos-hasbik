import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FormGroup from "../../geral-components/FormGroup";
import SelectGroup from "./components/SelectGroup";
import { Button } from "../../geral-components/Button";
import { FaBuilding, FaArrowLeft, FaUpload, FaTimes } from "react-icons/fa";
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

const FileUploadGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
    font-size: 14px;
    gap: 0.5rem;
  }

  .upload-area {
    border: 2px dashed #ddd;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    background-color: #fafafa;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      border-color: #007bff;
      background-color: #f0f8ff;
    }

    &.drag-over {
      border-color: #007bff;
      background-color: #e3f2fd;
    }
  }

  .upload-text {
    color: #6c757d;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .upload-subtext {
    color: #adb5bd;
    font-size: 12px;
  }

  .file-preview {
    margin-top: 12px;
    padding: 12px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .file-details {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .file-name {
      font-weight: 500;
      color: #495057;
    }

    .file-size {
      color: #6c757d;
      font-size: 12px;
    }

    .remove-file {
      background: none;
      border: none;
      color: #dc3545;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5c6cb;
      }
    }
  }

  .file-error {
    margin-top: 8px;
    color: #dc3545;
    font-size: 14px;
    font-weight: 500;
  }

  .file-help {
    margin-top: 8px;
    font-size: 12px;
    color: #6c757d;
    font-style: italic;
  }
`;

const CadastroEmpresa = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [errors, setErrors] = useState({});
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [arquivoZip, setArquivoZip] = useState(null);

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

  useEffect(() => {
    axios
      .get(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
      )
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
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/^(\d{5})(\d)/, "$1-$2");
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

    setForm((prev) => ({ ...prev, [name]: novoValor }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Verificar se é um arquivo ZIP
      if (
        !file.type.includes("zip") &&
        !file.name.toLowerCase().endsWith(".zip")
      ) {
        setErrors((prev) => ({
          ...prev,
          arquivo: "Por favor, selecione apenas arquivos ZIP.",
        }));
        setArquivoZip(null);
        return;
      }

      // Verificar tamanho do arquivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB em bytes
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          arquivo: "O arquivo deve ter no máximo 10MB.",
        }));
        setArquivoZip(null);
        return;
      }

      setArquivoZip(file);
      setErrors((prev) => ({ ...prev, arquivo: undefined }));
    }
  };

  const handleRemoveFile = () => {
    setArquivoZip(null);
    setErrors((prev) => ({ ...prev, arquivo: undefined }));
  };

  const uploadArquivoZip = async (empresaId, cnpjLimpo) => {
    if (!arquivoZip) return null;

    try {
      // Gerar nome único para o arquivo
      const timestamp = new Date().getTime();
      const nomeArquivo = `${empresaId}_${timestamp}_${arquivoZip.name}`;
      // Caminho do arquivo: pendente/CNPJ_DA_EMPRESA/nome_do_arquivo.zip
      const caminhoArquivo = `pendente/${cnpjLimpo}/${nomeArquivo}`;

      // Upload para o bucket 'documentos' na pasta 'pendente/CNPJ_DA_EMPRESA/'
      const { data, error } = await supabase.storage
        .from("documentos")
        .upload(caminhoArquivo, arquivoZip, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      return data.path;
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      throw new Error("Falha no upload do arquivo: " + error.message);
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
        cep: form.cep.replace(/\D/g, ""),
      };

      const validatedData = cadastroEmpresaSchema.parse(formSemMascara);

      const empresaData = {
        ...validatedData,
        senha_hash: hashPassword(validatedData.senha),
        aprovacao: "pendente",
      };
      delete empresaData.senha;

      // Inserir dados da empresa no banco
      const { data: empresaInserida, error: errorEmpresa } = await supabase
        .from("empresas")
        .insert([empresaData])
        .select()
        .single();

      if (errorEmpresa) throw errorEmpresa;

      // Se há arquivo ZIP, fazer upload
      let caminhoArquivo = null;
      if (arquivoZip) {
        try {
          const cnpjLimpo = form.cnpj.replace(/\D/g, ""); // CNPJ sem caracteres especiais
          caminhoArquivo = await uploadArquivoZip(
            empresaInserida.id,
            cnpjLimpo
          );

          // Atualizar registro da empresa com o caminho do arquivo
          const { error: errorUpdate } = await supabase
            .from("empresas")
            .update({ arquivo_zip_url: caminhoArquivo }) // Alterado para arquivo_zip_url
            .eq("id", empresaInserida.id);

          if (errorUpdate) {
            console.error("Erro ao atualizar caminho do arquivo:", errorUpdate);
          }
        } catch (uploadError) {
          // Se falhar o upload, ainda assim mantém o cadastro da empresa
          console.error("Erro no upload do arquivo:", uploadError);
          setMensagem({
            texto:
              "⚠️ Cadastro realizado, mas houve erro no upload do arquivo. Você pode enviar os documentos posteriormente.",
            tipo: "aviso",
          });
        }
      }

      if (!mensagem.texto) {
        setMensagem({
          texto: arquivoZip
            ? "✅ Cadastro realizado com sucesso! Documentos enviados. Aguarde a aprovação."
            : "✅ Cadastro realizado com sucesso! Aguarde a aprovação.",
          tipo: "sucesso",
        });
      }

      // Limpar formulário
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
          <Title>Cadastro de Empresa</Title>
          <CompanyIcon />
        </Header>
        {mensagem.texto && (
          <div
            style={{
              color:
                mensagem.tipo === "sucesso"
                  ? "green"
                  : mensagem.tipo === "aviso"
                  ? "orange"
                  : "red",
              marginBottom: "1rem",
              padding: "0.5rem",
              borderRadius: "4px",
              backgroundColor:
                mensagem.tipo === "sucesso"
                  ? "#f0f8f0"
                  : mensagem.tipo === "aviso"
                  ? "#fff8e1"
                  : "#ffeaea",
            }}
          >
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

          {/* Campo de upload de arquivo ZIP */}
          <FileUploadGroup>
            <label>
              <FaUpload />
              Documentos da Empresa (ZIP)
            </label>

            <div className="upload-area">
              <input
                type="file"
                accept=".zip,application/zip"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="arquivo-zip"
              />
              <label
                htmlFor="arquivo-zip"
                style={{ cursor: "pointer", width: "100%", display: "block" }}
              >
                <div className="upload-text">
                  Clique aqui para selecionar um arquivo ZIP
                </div>
                <div className="upload-subtext">
                  Ou arraste e solte o arquivo aqui
                </div>
              </label>
            </div>

            {arquivoZip && (
              <div className="file-preview">
                <div className="file-details">
                  <span>📎</span>
                  <div>
                    <div className="file-name">{arquivoZip.name}</div>
                    <div className="file-size">
                      {(arquivoZip.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  onClick={handleRemoveFile}
                  title="Remover arquivo"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {errors.arquivo && (
              <div className="file-error">{errors.arquivo}</div>
            )}

            <div className="file-help">
              Opcional. Envie documentos da empresa em formato ZIP (máximo 10MB)
            </div>
          </FileUploadGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Cadastrando..." : "Cadastrar Empresa"}
          </Button>
        </form>
      </FormWrapper>
    </Container>
  );
};

export default CadastroEmpresa;
