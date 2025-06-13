import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaSignOutAlt, FaExclamationTriangle } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";

const Container = styled.div`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  margin-bottom: 2rem;
  background-color: #1e40af;
  border-radius: 10px;
  color: white;
  position: relative;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
`;

const ButtonGroup = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #dc2626;
  }
`;

const List = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9fafb;
  }
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const InfoLine = styled.p`
  margin: 0;
  color: #374151;
  font-size: 0.95rem;
`;

const AtenderButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background-color: #059669;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const DashboardOcorrencias = () => {
  const navigate = useNavigate();
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");

    if (!storedUser || storedUserType !== "empresa") {
      navigate("/login");
      return;
    }

    const fetchOcorrencias = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase.from("Animais").select("*");

      if (error) {
        console.error("Erro ao buscar ocorrências:", error);
        setErrorMsg("Erro ao carregar as ocorrências.");
        setLoading(false);
        return;
      }

      setOcorrencias(data || []);
      setLoading(false);
    };

    fetchOcorrencias();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const handleAtender = async (animalId) => {
    try {
      const empresaStr = localStorage.getItem("user");
      if (!empresaStr) {
        alert("Usuário não autenticado.");
        return;
      }
      const empresa = JSON.parse(empresaStr);
      const empresaId = empresa?.id;
      if (!empresaId) {
        alert("ID da empresa não encontrado.");
        return;
      }
  
      const { error } = await supabase
        .from("Animais") // com aspas para tabela case sensitive
        .update({
          Em_Atendimento: true,
          Id_Empresa: empresaId,
        })
        .eq("id", animalId);
  
      if (error) {
        console.error("Erro ao atender ocorrência:", error);
        alert("Erro ao atender ocorrência.");
        return;
      }
  
      setOcorrencias((prev) =>
        prev.map((item) =>
          item.id === animalId
            ? { ...item, Em_Atendimento: true, Id_Empresa: empresaId }
            : item
        )
      );
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao atender ocorrência.");
    }
  }

  if (loading) return <Container>Carregando ocorrências...</Container>;

  if (errorMsg)
    return (
      <Container>
        <p style={{ color: "red", textAlign: "center" }}>{errorMsg}</p>
      </Container>
    );

  return (
    <Container>
      <Header>
        <Title>
          <FaExclamationTriangle style={{ marginRight: "0.5rem" }} />
          Ocorrências Registradas
        </Title>
        <ButtonGroup>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt />
            Sair
          </LogoutButton>
        </ButtonGroup>
      </Header>

      <List>
        {ocorrencias.length > 0 ? (
          ocorrencias.map((item) => (
            <Card key={item.id}>
              <InfoGroup>
                <InfoLine>
                  <strong>Espécie:</strong> {item.Especie || "—"}
                </InfoLine>
                <InfoLine>
                  <strong>Idade:</strong> {item.Idade || "—"}
                </InfoLine>
                <InfoLine>
                  <strong>Ferido:</strong> {item.Ferido ? "Sim" : "Não"}
                </InfoLine>
                <InfoLine>
                  <strong>Endereço:</strong> {item.Endereco || "—"}
                </InfoLine>
                <InfoLine>
                  <strong>Descrição:</strong> {item.Descricao || "—"}
                </InfoLine>
                {item.Em_Atendimento && (
                  <InfoLine>
                    <strong>Status:</strong> Em atendimento
                  </InfoLine>
                )}
              </InfoGroup>

              <AtenderButton
                onClick={() => handleAtender(item.id)}
                disabled={item.Em_Atendimento}
              >
                {item.Em_Atendimento ? "Já em Atendimento" : "Atender Ocorrência"}
              </AtenderButton>
            </Card>
          ))
        ) : (
          <p style={{ color: "#64748b", textAlign: "center" }}>
            Nenhuma ocorrência encontrada.
          </p>
        )}
      </List>
    </Container>
  );
};

export default DashboardOcorrencias;
