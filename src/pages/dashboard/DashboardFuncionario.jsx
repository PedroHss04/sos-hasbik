import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { FaBuilding, FaUser, FaSignOutAlt } from "react-icons/fa";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(to right, #dfe9f3, #ffffff);
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const WelcomeMessage = styled.div`
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserIcon = styled(FaUser)`
  font-size: 1.5rem;
  color: #4a5568;
`;

const CompanyIcon = styled(FaBuilding)`
  font-size: 1.5rem;
  color: #4a5568;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c53030;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const DashboardFuncionario = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const storedUser = localStorage.getItem("user");
      const storedUserType = localStorage.getItem("userType");

      // Verifica se o usuário está logado e é do tipo "funcionario"
      if (!storedUser || storedUserType !== "funcionario") {
        navigate("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setLoading(false);

      // Busca os dados da empresa do funcionário
      try {
        const { data: empresaData, error } = await supabase
          .from("empresas")
          .select("nome")
          .eq("id", parsedUser.empresa_id)
          .single();

        if (error) throw error;
        setEmpresa(empresaData);
      } catch (err) {
        console.error("Erro ao buscar dados da empresa:", err);
      }
    };

    checkUserAndFetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  if (loading) {
    return <Container>Carregando...</Container>;
  }

  if (!user) {
    return <Container>Acesso não autorizado.</Container>;
  }

  return (
    <Container>
      <Content>
        <Header>
          <h1>Dashboard do Funcionário</h1>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> Sair
          </LogoutButton>
        </Header>

        <WelcomeMessage>
          <UserIcon />
          <div>
            <h2>Bem-vindo(a), {user.nome}</h2>
            {empresa && (
              <p>
                <CompanyIcon /> Empresa: {empresa.nome}
              </p>
            )}
          </div>
        </WelcomeMessage>

        <CardGrid>
          <Card>
            <CardTitle>Minhas Tarefas</CardTitle>
            <p>Aqui você pode visualizar suas tarefas pendentes.</p>
          </Card>
          <Card>
            <CardTitle>Relatórios</CardTitle>
            <p>Acesse os relatórios e métricas importantes.</p>
          </Card>
          <Card>
            <CardTitle>Configurações</CardTitle>
            <p>Atualize suas informações pessoais e preferências.</p>
          </Card>
        </CardGrid>
      </Content>
    </Container>
  );
};

export default DashboardFuncionario;
