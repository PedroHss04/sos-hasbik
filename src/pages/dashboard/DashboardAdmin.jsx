import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { FaCheck, FaTimes, FaFileArchive, FaSignOutAlt } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

// --- Styled Components ---
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: linear-gradient(to right, #dfe9f3, #ffffff);
  padding: 2rem;
  box-sizing: border-box;
`;

const Header = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: #dc2626;
  }
`;

const Table = styled.table`
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
`;

const TableHead = styled.thead`
  background-color: #4a5568;
  color: white;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f7fafc;
  }
`;

const TableHeader = styled.th`
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #edf2f7;
  color: #4a5568;
  font-size: 0.95rem;
`;

const ActionButton = styled.button`
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
  margin-right: 0.5rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ApproveButton = styled(ActionButton)`
  background-color: #48bb78;
  color: white;

  &:hover {
    background-color: #38a169;
  }
`;

const RejectButton = styled(ActionButton)`
  background-color: #ef4444;
  color: white;

  &:hover {
    background-color: #dc2626;
  }
`;

const DownloadButton = styled(ActionButton)`
  background-color: #3b82f6;
  color: white;

  &:hover {
    background-color: #2563eb;
  }
`;

const LoadingIcon = styled(ImSpinner8)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [processing, setProcessing] = useState(null); // Para controlar botões durante processamento

  useEffect(() => {
    const fetchAdminData = async () => {
      const storedUser = localStorage.getItem("user");
      const storedUserType = localStorage.getItem("userType");

      if (!storedUser || storedUserType !== "admin") {
        navigate("/login");
        return;
      }

      setUser(JSON.parse(storedUser));
      setLoading(true);
      setError(null);

      try {
        // Buscar empresas pendentes com o campo arquivo_zip_url
        const { data: empresasPendentes, error: empresasError } = await supabase
          .from("empresas")
          .select("id, nome, cnpj, arquivo_zip_url")
          .eq("aprovacao", "pendente");

        if (empresasError) {
          setError(
            "Erro ao carregar empresas pendentes: " + empresasError.message
          );
          console.error("Supabase fetch error:", empresasError);
        } else {
          setCompanies(empresasPendentes || []);
        }
      } catch (err) {
        setError("Erro inesperado ao carregar dados.");
        console.error("Admin Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  // Função para mover arquivo no Supabase Storage
  const moverArquivo = async (caminhoAtual, novaPasta, empresaId) => {
    if (!caminhoAtual) return null;

    try {
      // Extrair o nome do arquivo do caminho atual
      const nomeArquivo = caminhoAtual.split("/").pop();
      const novoCaminho = `${novaPasta}/${nomeArquivo}`;

      // Copiar arquivo para nova pasta
      const { data: copyData, error: copyError } = await supabase.storage
        .from("documentos")
        .copy(caminhoAtual, novoCaminho);

      if (copyError) throw copyError;

      // Remover arquivo da pasta antiga
      const { error: removeError } = await supabase.storage
        .from("documentos")
        .remove([caminhoAtual]);

      if (removeError) {
        console.warn("Erro ao remover arquivo da pasta antiga:", removeError);
        // Não falha a operação se não conseguir remover o arquivo antigo
      }

      // Atualizar registro da empresa com o novo caminho
      const { error: updateError } = await supabase
        .from("empresas")
        .update({ arquivo_zip_url: novoCaminho })
        .eq("id", empresaId);

      if (updateError) throw updateError;

      return novoCaminho;
    } catch (error) {
      console.error("Erro ao mover arquivo:", error);
      throw error;
    }
  };

  const handleApprove = async (companyId) => {
    setProcessing(companyId);
    setError(null);

    try {
      // Encontrar a empresa para obter o caminho do arquivo
      const empresa = companies.find((c) => c.id === companyId);

      // Mover arquivo para pasta 'aprovadas' se existir
      if (empresa && empresa.arquivo_zip_url) {
        await moverArquivo(empresa.arquivo_zip_url, "aprovadas", companyId);
      }

      // Atualizar status da empresa para aprovada
      const { error: updateError } = await supabase
        .from("empresas")
        .update({ aprovacao: "aprovada" })
        .eq("id", companyId);

      if (updateError) {
        setError("Erro ao aprovar empresa: " + updateError.message);
      } else {
        // Remover empresa da lista de pendentes
        setCompanies(companies.filter((company) => company.id !== companyId));
      }
    } catch (err) {
      setError("Erro inesperado ao aprovar empresa: " + err.message);
      console.error("Approve Error:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (companyId) => {
    setProcessing(companyId);
    setError(null);

    try {
      // Encontrar a empresa para obter o caminho do arquivo
      const empresa = companies.find((c) => c.id === companyId);

      // Mover arquivo para pasta 'recusadas' se existir
      if (empresa && empresa.arquivo_zip_url) {
        await moverArquivo(empresa.arquivo_zip_url, "recusadas", companyId);
      }

      // Atualizar status da empresa para recusada
      const { error: updateError } = await supabase
        .from("empresas")
        .update({ aprovacao: "recusada" })
        .eq("id", companyId);

      if (updateError) {
        setError("Erro ao recusar empresa: " + updateError.message);
      } else {
        // Remover empresa da lista de pendentes
        setCompanies(companies.filter((company) => company.id !== companyId));
      }
    } catch (err) {
      setError("Erro inesperado ao recusar empresa: " + err.message);
      console.error("Reject Error:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDownload = async (arquivoZipUrl, companyId) => {
    setDownloading(companyId);
    setError(null);

    if (!arquivoZipUrl) {
      setError("Caminho do documento não disponível.");
      setDownloading(null);
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("documentos")
        .createSignedUrl(arquivoZipUrl, 3600);

      if (error) {
        setError("Erro ao gerar URL de download: " + error.message);
      } else {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = arquivoZipUrl.substring(
          arquivoZipUrl.lastIndexOf("/") + 1
        );
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError("Erro inesperado ao baixar arquivo: " + err.message);
    } finally {
      setDownloading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  if (loading)
    return <Container>Carregando empresas para aprovação...</Container>;
  if (error)
    return <Container style={{ color: "red" }}>Erro: {error}</Container>;
  if (!user) return <Container>Acesso não autorizado.</Container>;

  return (
    <Container>
      <Header>
        <Title>Painel de Administração - Aprovação de Empresas</Title>
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt /> Sair
        </LogoutButton>
      </Header>

      {companies.length === 0 ? (
        <p>Não há empresas aguardando aprovação no momento.</p>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Empresa</TableHeader>
              <TableHeader>CNPJ</TableHeader>
              <TableHeader>Documentos</TableHeader>
              <TableHeader>Ações</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.nome}</TableCell>
                <TableCell>{company.cnpj}</TableCell>
                <TableCell>
                  {company.arquivo_zip_url ? (
                    <DownloadButton
                      onClick={() =>
                        handleDownload(company.arquivo_zip_url, company.id)
                      }
                      disabled={downloading === company.id}
                    >
                      {downloading === company.id ? (
                        <>
                          <LoadingIcon /> Baixando...
                        </>
                      ) : (
                        <>
                          <FaFileArchive /> Baixar Documentos
                        </>
                      )}
                    </DownloadButton>
                  ) : (
                    "Nenhum documento enviado"
                  )}
                </TableCell>
                <TableCell>
                  <ApproveButton
                    onClick={() => handleApprove(company.id)}
                    disabled={processing === company.id}
                  >
                    {processing === company.id ? (
                      <>
                        <LoadingIcon /> Processando...
                      </>
                    ) : (
                      <>
                        <FaCheck /> Aprovar
                      </>
                    )}
                  </ApproveButton>
                  <RejectButton
                    onClick={() => handleReject(company.id)}
                    disabled={processing === company.id}
                  >
                    {processing === company.id ? (
                      <>
                        <LoadingIcon /> Processando...
                      </>
                    ) : (
                      <>
                        <FaTimes /> Recusar
                      </>
                    )}
                  </RejectButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default DashboardAdmin;
