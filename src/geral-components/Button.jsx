import styled from "styled-components";

export const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 1rem;
  background: #4f46e5;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  transition: background 0.3s;

  &:hover {
    background: #4338ca;
  }

  &:disabled {
    background-color: #999;
    cursor: not-allowed;
  }
`;
