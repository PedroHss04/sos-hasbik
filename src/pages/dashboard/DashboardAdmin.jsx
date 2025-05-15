import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "../../lib/supabaseClient";
import {
  FaBuilding,
  FaCheck,
  FaTimes,
  FaFileArchive,
  FaSpinner,
} from "react-icons/fa";

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHead = styled.thead`
  background-color: #f2f2f2;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
`;

const TableHeader = styled.th`
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
  font-weight: bold;
`;

const ActionButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: background-color 0.2s ease;
`;

const ApproveButton = styled(ActionButton)`
  background-color: #4caf50;
  color: white;

  &:hover {
    background-color: #45a049;
  }
`;

const RejectButton = styled(ActionButton)`
  background-color: #f44336;
  color: white;

  &:hover {
    background-color: #d32f2f;
  }
`;

const DownloadButton = styled(ActionButton)`
  background-color: #007bff;
  color: white;

  &:hover {
    background-color: #0056b3;
  }
`;

const LoadingIcon = styled(FaSpinner)`
  animation: spin 1s linear infinite;
`;

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [downloading, setDownloading] = useState(null);

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
        const { data: empresasPendentes, error: empresasError } = await supabase
          .from("empresas")
          .select("id, nome, cnpj, arquivo_zip_url")
          .eq("aprovacao", "pendente");

        if (empresasError) {
          setError("Erro ao carregar empresas pendentes.");
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

  const handleApprove = async (companyId) => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("empresas")
        .update({ aprovacao: "aprovada" })
        .eq("id", companyId);

      if (updateError) {
        setError("Erro ao aprovar empresa.");
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
        setError("Erro ao recusar empresa.");
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

  const handleDownload = async (filePath, companyId) => {
    setDownloading(companyId);
    setError(null);
    try {
      const { data, error: signedUrlError } = await supabase.storage
        .from("documentos")
        .createSignedUrl(filePath, { expiresIn: 3600 }); // 3600 é um número inteiro

      if (signedUrlError) {
        setError("Erro ao gerar URL de download.");
        console.error("Download Error:", signedUrlError);
      } else {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = filePath.substring(filePath.lastIndexOf("/") + 1);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError("Erro inesperado ao baixar arquivo.");
      console.error("Download Error:", err);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return <Container>Carregando empresas para aprovação...</Container>;
  }

  if (error) {
    return <Container>Erro: {error}</Container>;
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
