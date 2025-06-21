import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  FaCheck,
  FaTimes,
  FaFileArchive,
  FaSignOutAlt,
  FaPaperPlane,
} from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

// --- Keyframes for animations ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

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
  transition: all 0.2s ease;
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
  &:hover:not(:disabled) {
    background-color: #38a169;
  }
`;

const RejectButton = styled(ActionButton)`
  background-color: #ef4444;
  color: white;
  &:hover:not(:disabled) {
    background-color: #dc2626;
  }
`;

const DownloadButton = styled(ActionButton)`
  background-color: #3b82f6;
  color: white;
  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
`;

const LoadingIcon = styled(ImSpinner8)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// --- Modal Styled Components ---
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${slideIn} 0.4s ease-out;
`;

const ModalHeader = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const CancelButton = styled(ActionButton)`
  background-color: #a0aec0;
  color: white;
  &:hover:not(:disabled) {
    background-color: #718096;
  }
`;

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [processing, setProcessing] = useState(null);

  // --- State for Rejection Modal ---
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [companyToReject, setCompanyToReject] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      // ... (código existente para buscar dados, sem alterações)
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
          setError(
            "Erro ao carregar empresas pendentes: " + empresasError.message
          );
        } else {
          setCompanies(empresasPendentes || []);
        }
      } catch (err) {
        setError("Erro inesperado ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const moverArquivo = async (caminhoAtual, novaPasta, empresaId) => {
    // ... (código existente para mover arquivo, sem alterações)
    if (!caminhoAtual) return null;

    try {
      const nomeArquivo = caminhoAtual.split("/").pop();
      const novoCaminho = `${novaPasta}/${nomeArquivo}`;

      const { error: copyError } = await supabase.storage
        .from("documentos")
        .copy(caminhoAtual, novoCaminho);

      if (copyError) throw copyError;

      const { error: removeError } = await supabase.storage
        .from("documentos")
        .remove([caminhoAtual]);

      if (removeError) {
        console.warn("Erro ao remover arquivo da pasta antiga:", removeError);
      }

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
    // ... (código existente para aprovar, sem alterações)
    setProcessing(companyId);
    setError(null);
    try {
      const empresa = companies.find((c) => c.id === companyId);
      if (empresa && empresa.arquivo_zip_url) {
        await moverArquivo(empresa.arquivo_zip_url, "aprovadas", companyId);
      }
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
      setError("Erro inesperado ao aprovar empresa: " + err.message);
    } finally {
      setProcessing(null);
    }
  };

  // --- NOVA LÓGICA DE RECUSA ---

  const openRejectModal = (company) => {
    setCompanyToReject(company);
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectionReason("");
    setCompanyToReject(null);
    setProcessing(null); // Garante que o estado de processamento seja limpo
  };

  const confirmRejection = async () => {
    if (!companyToReject || rejectionReason.trim() === "") {
      setError("A justificativa é obrigatória para recusar uma empresa.");
      return;
    }

    setProcessing(companyToReject.id);
    setError(null);

    try {
      if (companyToReject.arquivo_zip_url) {
        await moverArquivo(
          companyToReject.arquivo_zip_url,
          "recusadas",
          companyToReject.id
        );
      }

      // Atualiza o status E ADICIONA O MOTIVO DA RECUSA
      const { error: updateError } = await supabase
        .from("empresas")
        .update({
          aprovacao: "recusada",
          motivo_recusa: rejectionReason.trim(),
        })
        .eq("id", companyToReject.id);

      if (updateError) {
        setError("Erro ao recusar empresa: " + updateError.message);
      } else {
        setCompanies(
          companies.filter((company) => company.id !== companyToReject.id)
        );
      }
    } catch (err) {
      setError("Erro inesperado ao recusar empresa: " + err.message);
    } finally {
      // Fecha o modal e reseta os estados, independentemente do resultado
      closeRejectModal();
    }
  };

  const handleDownload = async (arquivoZipUrl, companyId) => {
    // ... (código de download existente, sem alterações)
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
        link.download = arquivoZipUrl.split("/").pop();
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
    <>
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
                          <LoadingIcon />
                        ) : (
                          <FaFileArchive />
                        )}
                        {downloading === company.id
                          ? " Baixando..."
                          : " Baixar Documentos"}
                      </DownloadButton>
                    ) : (
                      "Nenhum documento enviado"
                    )}
                  </TableCell>
                  <TableCell>
                    <ApproveButton
                      onClick={() => handleApprove(company.id)}
                      disabled={processing !== null}
                    >
                      {processing === company.id ? (
                        <LoadingIcon />
                      ) : (
                        <FaCheck />
                      )}
                      {processing === company.id
                        ? " Processando..."
                        : " Aprovar"}
                    </ApproveButton>
                    <RejectButton
                      onClick={() => openRejectModal(company)} // MODIFICADO
                      disabled={processing !== null}
                    >
                      <FaTimes /> Recusar
                    </RejectButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Container>

      {/* --- RENDERIZAÇÃO DO MODAL DE RECUSA --- */}
      {isRejectModalOpen && (
        <ModalBackdrop>
          <ModalContent>
            <ModalHeader>Justificar Recusa da Empresa</ModalHeader>
            <ModalBody>
              <p>
                Por favor, descreva o motivo pelo qual a empresa{" "}
                <strong>{companyToReject?.nome}</strong> está sendo recusada.
                Esta mensagem poderá ser visualizada pelo solicitante.
              </p>
              <TextArea
                placeholder="Ex: Documentação inválida, CNPJ não corresponde ao cadastro, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                autoFocus
              />
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={closeRejectModal}>Cancelar</CancelButton>
              <ApproveButton // Reutilizando estilo, mas com função de envio
                onClick={confirmRejection}
                disabled={
                  rejectionReason.trim() === "" ||
                  processing === companyToReject.id
                }
              >
                {processing === companyToReject.id ? (
                  <>
                    <LoadingIcon /> Enviando...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Enviar Recusa
                  </>
                )}
              </ApproveButton>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}
    </>
  );
};

export default DashboardAdmin;
