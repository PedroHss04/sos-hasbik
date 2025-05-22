import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient"; // Ensure this path is correct
import { FaCheck, FaTimes, FaFileArchive } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im"; // For loading icon

// --- Styled Components (Add these if not already in your project) ---
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

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden; /* Ensures rounded corners apply to content */
`;

const TableHead = styled.thead`
  background-color: #4a5568; /* Darker gray */
  color: white;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f7fafc; /* Light gray for even rows */
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
  border-bottom: 1px solid #edf2f7; /* Lighter border */
  color: #4a5568; /* Darker text */
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
  margin-right: 0.5rem; /* Space between buttons */

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ApproveButton = styled(ActionButton)`
  background-color: #48bb78; /* Green */
  color: white;

  &:hover {
    background-color: #38a169;
  }
`;

const RejectButton = styled(ActionButton)`
  background-color: #ef4444; /* Red */
  color: white;

  &:hover {
    background-color: #dc2626;
  }
`;

const DownloadButton = styled(ActionButton)`
  background-color: #3b82f6; /* Blue */
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

// --- DashboardAdmin Component ---
const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [downloading, setDownloading] = useState(null); // Tracks which company's file is being downloaded

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
        // Fetch companies AND their associated documents (specifically the ZIP file)
        const { data: empresasPendentes, error: empresasError } = await supabase
          .from("empresas")
          .select(
            `
            id,
            nome,
            cnpj,
            documentos (
              url,
              pasta_arquivo,
              nome_arquivo,
              tipo
            )
          `
          )
          .eq("aprovacao", "pendente");

        if (empresasError) {
          setError(
            "Erro ao carregar empresas pendentes: " + empresasError.message
          );
          console.error("Supabase fetch error:", empresasError);
        } else {
          // Process the fetched data to get the specific document path for the ZIP file
          const companiesWithDocPaths = empresasPendentes.map((company) => {
            // Assuming 'comprovante_endereco' or similar is the type for the ZIP file
            const zipDoc = company.documentos.find(
              (doc) => doc.tipo === "comprovante_endereco" // Or whatever 'tipo' you assign to the ZIP
            );

            let fullBucketPath = null;
            if (zipDoc && zipDoc.pasta_arquivo && zipDoc.nome_arquivo) {
              // Construct the exact path within the bucket
              fullBucketPath = `${zipDoc.pasta_arquivo}${zipDoc.nome_arquivo}`;
            }

            return {
              ...company,
              full_bucket_path: fullBucketPath, // Add this new property
              documentos: undefined, // Clear nested documents if not needed in UI directly
            };
          });
          setCompanies(companiesWithDocPaths || []);
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

  const handleApprove = async (companyId) => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("empresas")
        .update({ aprovacao: "aprovada" })
        .eq("id", companyId);

      if (updateError) {
        setError("Erro ao aprovar empresa: " + updateError.message);
      } else {
        setCompanies(companies.filter((company) => company.id !== companyId));
      }
    } catch (err) {
      setError("Erro inesperado ao aprovar empresa.");
      console.error("Approve Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (companyId) => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("empresas")
        .update({ aprovacao: "recusada" })
        .eq("id", companyId);

      if (updateError) {
        setError("Erro ao recusar empresa: " + updateError.message);
      } else {
        setCompanies(companies.filter((company) => company.id !== companyId));
      }
    } catch (err) {
      setError("Erro inesperado ao recusar empresa.");
      console.error("Reject Error:", err);
    } finally {
      setLoading(false);
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
        .from("documentos") // Make sure 'documentos' is your actual bucket name
        .createSignedUrl(fullBucketPath, 3600); // 3600 seconds (1 hour) validity

      if (signedUrlError) {
        // Log the full error to the console for debugging
        console.error("Erro ao gerar URL de download:", signedUrlError);
        setError("Erro ao gerar URL de download: " + signedUrlError.message);
      } else {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        // Extract filename from the fullBucketPath for the download attribute
        link.download = fullBucketPath.substring(
          fullBucketPath.lastIndexOf("/") + 1
        );
        link.target = "_blank"; // Open in new tab
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      // Catch any unexpected errors during the process
      setError("Erro inesperado ao baixar arquivo: " + err.message);
      console.error("Download Error:", err);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return <Container>Carregando empresas para aprovação...</Container>;
  }

  if (error) {
    return <Container style={{ color: "red" }}>Erro: {error}</Container>;
  }

  if (!user) {
    return <Container>Acesso não autorizado.</Container>;
  }

  return (
    <Container>
      <Title>Painel de Administração - Aprovação de Empresas</Title>
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
                  <ApproveButton onClick={() => handleApprove(company.id)}>
                    <FaCheck /> Aprovar
                  </ApproveButton>
                  <RejectButton onClick={() => handleReject(company.id)}>
                    <FaTimes /> Recusar
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
