import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBuilding, FaArrowLeft, FaUpload, FaTimes } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import { hashPassword } from "../../utils/passwordUtils";
import { cadastroEmpresaSchema } from "../../utils/validationSchemas";
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

const FileUploadArea = styled.div`
  border: 2px dashed ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  text-align: center;
  background: ${theme.colors.gray[50]};
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: ${theme.spacing.lg};

  &:hover {
    border-color: ${theme.colors.primary[400]};
    background: ${theme.colors.primary[50]};
  }

  &.drag-over {
    border-color: ${theme.colors.primary[500]};
    background: ${theme.colors.primary[100]};
  }
`;

const UploadText = styled.div`
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.sm};
  margin-bottom: ${theme.spacing.xs};
`;

const UploadSubtext = styled.div`
  color: ${theme.colors.gray[400]};
  font-size: ${theme.fontSizes.xs};
`;

const FilePreview = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FileDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 500;
  color: ${theme.colors.gray[700]};
`;

const FileSize = styled.div`
  color: ${theme.colors.gray[500]};
  font-size: ${theme.fontSizes.xs};
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.danger[500]};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${theme.colors.danger[50]};
  }
`;

const FileHelp = styled.div`
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.gray[500]};
  font-style: italic;
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
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
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
      if (!file.type.includes("zip") && !file.name.toLowerCase().endsWith(".zip")) {
        setErrors((prev) => ({
          ...prev,
          arquivo: "Por favor, selecione apenas arquivos ZIP.",
        }));
        setArquivoZip(null);
        return;
      }

      const maxSize = 10 * 1024 * 1024;
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
      const timestamp = new Date().getTime();
      const nomeArquivo = `${empresaId}_${timestamp}_${arquivoZip.name}`;
      const caminhoArquivo = `pendente/${cnpjLimpo}/${nomeArquivo}`;

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

      const { data: empresaInserida, error: errorEmpresa } = await supabase
        .from("empresas")
        .insert([empresaData])
        .select()
        .single();

      if (errorEmpresa) throw errorEmpresa;

      let caminhoArquivo = null;
      if (arquivoZip) {
        try {
          const cnpjLimpo = form.cnpj.replace(/\D/g, "");
          caminhoArquivo = await uploadArquivoZip(empresaInserida.id, cnpjLimpo);

          const { error: errorUpdate } = await supabase
            .from("empresas")
            .update({ arquivo_zip_url: caminhoArquivo })
            .eq("id", empresaInserida.id);

          if (errorUpdate) {
            console.error("Erro ao atualizar caminho do arquivo:", errorUpdate);
          }
        } catch (uploadError) {
          console.error("Erro no upload do arquivo:", uploadError);
          setMensagem({
            texto: "⚠️ Cadastro realizado, mas houve erro no upload do arquivo. Você pode enviar os documentos posteriormente.",
            tipo: "warning",
          });
        }
      }

      if (!mensagem.texto) {
        setMensagem({
          texto: arquivoZip
            ? "✅ Cadastro realizado com sucesso! Documentos enviados. Aguarde a aprovação."
            : "✅ Cadastro realizado com sucesso! Aguarde a aprovação.",
          tipo: "success",
        });
      }

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
          tipo: "error",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <FormCard>
        <BackButton 
          variant="secondary" 
          onClick={() => navigate("/login")}
          style={{ marginBottom: theme.spacing.lg }}
        >
          <FaArrowLeft /> Voltar para Login
        </BackButton>

        <Header>
          <Title>
            <FaBuilding />
            Cadastro de Empresa
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
              label="Nome da Empresa"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              error={errors.nome}
              required
              placeholder="Digite o nome da empresa"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Input
                label="CNPJ"
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                error={errors.cnpj}
                required
                placeholder="00.000.000/0000-00"
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
                placeholder="empresa@exemplo.com"
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

          <FormGroup>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: theme.spacing.sm,
              fontWeight: 600,
              color: theme.colors.gray[700],
              marginBottom: theme.spacing.sm
            }}>
              <FaUpload />
              Documentos da Empresa (ZIP)
            </label>

            <FileUploadArea>
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
                <UploadText>
                  Clique aqui para selecionar um arquivo ZIP
                </UploadText>
                <UploadSubtext>
                  Ou arraste e solte o arquivo aqui
                </UploadSubtext>
              </label>
            </FileUploadArea>

            {arquivoZip && (
              <FilePreview>
                <FileDetails>
                  <span>📎</span>
                  <div>
                    <FileName>{arquivoZip.name}</FileName>
                    <FileSize>
                      {(arquivoZip.size / 1024 / 1024).toFixed(2)} MB
                    </FileSize>
                  </div>
                </FileDetails>
                <RemoveFileButton
                  type="button"
                  onClick={handleRemoveFile}
                  title="Remover arquivo"
                >
                  <FaTimes />
                </RemoveFileButton>
              </FilePreview>
            )}

            {errors.arquivo && (
              <Alert type="error" style={{ marginTop: theme.spacing.sm }}>
                {errors.arquivo}
              </Alert>
            )}

            <FileHelp>
              Opcional. Envie documentos da empresa em formato ZIP (máximo 10MB)
            </FileHelp>
          </FormGroup>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            loading={isSubmitting}
            style={{ width: '100%', marginTop: theme.spacing.lg }}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Empresa"}
          </Button>
        </form>
      </FormCard>
    </PageContainer>
  );
};

export default CadastroEmpresa;