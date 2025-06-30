import styled from "styled-components";

export const Mensagem = styled.div`
  color: ${(props) => {
    if (props.tipo === "sucesso") return "green";
    if (props.tipo === "erro") return "red";
    return "black";
  }};
  margin-bottom: 1rem;
`;
