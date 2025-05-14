import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
`;

const AnimalName = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const AnimalDetails = styled.p`
  font-size: 1rem;
  margin: 0.5rem 0;
`;

const CloseButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background: #dc2626;
  }
`;

const DetalhesAnimal = ({ animal, onClose }) => {
  if (!animal) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <AnimalName>{animal.nome}</AnimalName>
        <AnimalDetails>Espécie: {animal.Especie}</AnimalDetails>
        <AnimalDetails>Idade: {animal.Idade}</AnimalDetails>
        <AnimalDetails>Cadastrado em: {animal.dataCadastro}</AnimalDetails>
        <CloseButton onClick={onClose}>Fechar</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DetalhesAnimal;
