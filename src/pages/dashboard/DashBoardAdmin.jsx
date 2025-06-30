import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "../../lib/supabaseClient";
import { FaCheck, FaTimes, FaFileArchive, FaFilter } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(to right, #dfe9f3, #ffffff);
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background-color: ${(props) => (props.active ? "#007bff" : "white")};
  color: ${(props) => (props.active ? "white" : "#333")};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.active ? "#0056b3" : "#f2f2f2")};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
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

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #edf2f7;
  color: #4a5568;
  font-size: 0.95rem;
`;

const TableHeader = styled.th`
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatusCell = styled(TableCell)`
  color: ${(props) => {
    switch (props.status) {
      case "aprovada":
        return "#4caf50";
      case "pendente":
        return "#ff9800";
      case "recusada":
        return "#f44336";
      default:
        return "#333";
    }
  }};
  font-weight: bold;
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

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  color: #333;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const formatCNPJ = (cnpj) => {
  if (!cnpj) return "-";
  const numericCNPJ = cnpj.replace(/\D/g, "");

  if (numericCNPJ.length === 14) {
    return numericCNPJ.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }
  return cnpj;
};

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [processing, setProcessing] = useState(null); // Para controlar botões durante processamento
  const [filters, setFilters] = useState({
    aprovada: false,
    recusada: false,
  });

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
        const { data: empresas, error: empresasError } = await supabase
          .from("empresas")
          .select(
            `
            id,
            nome,
            cnpj,
            aprovacao,
            arquivo_zip_url 
    
          `
          )
          .order("aprovacao", { ascending: true }); // Ordena para pendentes virem primeiro, etc.

        if (empresasError) {
          setError("Erro ao carregar empresas: " + empresasError.message);
          console.error("Supabase fetch error:", empresasError);
        } else {
          // O `arquivo_zip_url` já vem pronto para ser `full_bucket_path`
          const processedCompanies = empresas.map((company) => ({
            ...company,
            full_bucket_path: company.arquivo_zip_url,
          }));
          setAllCompanies(processedCompanies || []);
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
      // Assume que o caminhoAtual já inclui a pasta CNPJ, ex: "pendente/12345678901234/meu_arquivo.zip"
      // Precisamos extrair o CNPJ para manter a estrutura de pasta: novaPasta/CNPJ/nome_do_arquivo.zip
      const caminhoPartes = caminhoAtual.split("/");
      const cnpjFolder = caminhoPartes.length > 2 ? caminhoPartes[1] : ""; // Pega o CNPJ da pasta, se existir

      const novoCaminho = `${novaPasta}/${cnpjFolder}/${nomeArquivo}`;

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

  const toggleFilter = (filterName) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName],
    });
  };

  const handleApprove = async (companyId) => {
    setProcessing(companyId);
    setError(null);

    try {
      const empresa = allCompanies.find((c) => c.id === companyId);

      // Mover arquivo para pasta 'aprovadas' se existir e for pendente
      if (
        empresa &&
        empresa.full_bucket_path &&
        empresa.aprovacao === "pendente"
      ) {
        await moverArquivo(empresa.full_bucket_path, "aprovadas", companyId);
      }

      // Atualizar status da empresa para aprovada
      const { error: updateError } = await supabase
        .from("empresas")
        .update({ aprovacao: "aprovada" })
        .eq("id", companyId);

      if (updateError) {
        setError("Erro ao aprovar empresa: " + updateError.message);
      } else {
        // Atualiza o estado para refletir a mudança de status e possivelmente o novo caminho do arquivo
        setAllCompanies((prevCompanies) =>
          prevCompanies.map((c) =>
            c.id === companyId ? { ...c, aprovacao: "aprovada" } : c
          )
        );
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
      const empresa = allCompanies.find((c) => c.id === companyId);

      // Mover arquivo para pasta 'recusadas' se existir e for pendente
      if (
        empresa &&
        empresa.full_bucket_path &&
        empresa.aprovacao === "pendente"
      ) {
        await moverArquivo(empresa.full_bucket_path, "recusadas", companyId);
      }

      // Atualizar status da empresa para recusada
      const { error: updateError } = await supabase
        .from("empresas")
        .update({ aprovacao: "recusada" })
        .eq("id", companyId);

      if (updateError) {
        setError("Erro ao recusar empresa: " + updateError.message);
      } else {
        // Atualiza o estado para refletir a mudança de status e possivelmente o novo caminho do arquivo
        setAllCompanies((prevCompanies) =>
          prevCompanies.map((c) =>
            c.id === companyId ? { ...c, aprovacao: "recusada" } : c
          )
        );
      }
    } catch (err) {
      setError("Erro inesperado ao recusar empresa: " + err.message);
      console.error("Reject Error:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDownload = async (fullBucketPath, companyId) => {
    setDownloading(companyId);
    setError(null);

    if (!fullBucketPath) {
      setError("Caminho do documento não disponível.");
      setDownloading(null);
      return;
    }

    try {
      const { data, error: signedUrlError } = await supabase.storage
        .from("documentos")
        .createSignedUrl(fullBucketPath, 3600); // 3600 segundos = 1 hora de validade

      if (signedUrlError) {
        console.error("Erro ao gerar URL de download:", signedUrlError);
        setError("Erro ao gerar URL de download: " + signedUrlError.message);
      } else {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        // Pega o nome do arquivo da parte final do caminho
        link.download = fullBucketPath.substring(
          fullBucketPath.lastIndexOf("/") + 1
        );
        link.target = "_blank"; // Abre em nova aba
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError("Erro inesperado ao baixar arquivo: " + err.message);
      console.error("Download Error:", err);
    } finally {
      setDownloading(null);
    }
  };

  // Separa as empresas pendentes das outras para exibição em seções diferentes
  const pendingCompanies = allCompanies.filter(
    (company) => company.aprovacao === "pendente"
  );

  // Filtra as empresas aprovadas/recusadas conforme os filtros
  const otherCompanies = allCompanies
    .filter((company) => company.aprovacao !== "pendente")
    .filter((company) => {
      // Se nenhum filtro estiver ativo, mostra todas as não-pendentes
      if (!filters.aprovada && !filters.recusada) return true;
      // Se filtro "aprovada" ativo e a empresa é aprovada
      if (filters.aprovada && company.aprovacao === "aprovada") return true;
      // Se filtro "recusada" ativo e a empresa é recusada
      if (filters.recusada && company.aprovacao === "recusada") return true;
      return false; // Não atende a nenhum filtro ativo
    });

  if (loading && allCompanies.length === 0) {
    return <Container>Carregando empresas...</Container>;
  }

  if (error) {
    return <Container style={{ color: "red" }}>Erro: {error}</Container>;
  }

  if (!user) {
    return <Container>Acesso não autorizado.</Container>;
  }

  return (
    <Container>
      <Title>Painel de Administração - Todas as Empresas</Title>

      <FiltersContainer>
        <FaFilter />
        <span>Filtrar:</span>
        <FilterButton
          active={filters.aprovada}
          onClick={() => toggleFilter("aprovada")}
        >
          Aprovadas
        </FilterButton>
        <FilterButton
          active={filters.recusada}
          onClick={() => toggleFilter("recusada")}
        >
          Recusadas
        </FilterButton>
      </FiltersContainer>

      {pendingCompanies.length > 0 && (
        <>
          <SectionTitle>Empresas Pendentes</SectionTitle>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Empresa</TableHeader>
                <TableHeader>CNPJ</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Documentos</TableHeader>
                <TableHeader>Ações</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {pendingCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.nome}</TableCell>
                  <TableCell>{formatCNPJ(company.cnpj)}</TableCell>
                  <StatusCell status={company.aprovacao}>
                    {company.aprovacao}
                  </StatusCell>
                  <TableCell>
                    {company.full_bucket_path ? (
                      <DownloadButton
                        onClick={() =>
                          handleDownload(company.full_bucket_path, company.id)
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
                    <ActionButtonsContainer>
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
                    </ActionButtonsContainer>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {/* --- */}

      <SectionTitle>
        {!filters.aprovada && !filters.recusada
          ? "Outras Empresas (Aprovadas/Recusadas)" // Título para as demais empresas
          : "Empresas Filtradas"}
      </SectionTitle>

      {otherCompanies.length === 0 ? (
        <p>Nenhuma empresa encontrada com os filtros selecionados.</p>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Empresa</TableHeader>
              <TableHeader>CNPJ</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Documentos</TableHeader>
              <TableHeader>Ações</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {otherCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.nome}</TableCell>
                <TableCell>{formatCNPJ(company.cnpj)}</TableCell>
                <StatusCell status={company.aprovacao}>
                  {company.aprovacao}
                </StatusCell>
                <TableCell>
                  {company.full_bucket_path ? (
                    <DownloadButton
                      onClick={() =>
                        handleDownload(company.full_bucket_path, company.id)
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
                {/* As empresas aprovadas/recusadas não precisam das ações de aprovar/recusar novamente */}
                <TableCell>-</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default DashboardAdmin;
