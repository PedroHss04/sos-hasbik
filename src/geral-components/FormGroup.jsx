import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 6px;
  border: 1px solid ${(props) => (props.error ? "#dc2626" : "black")};
  border-radius: 5px;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.error ? "#dc2626" : "#4f46e5")};
    box-shadow: 0 0 0 2px
      ${(props) =>
        props.error ? "rgba(220, 38, 38, 0.2)" : "rgba(79, 70, 229, 0.2)"};
  }
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
`;

const FormGroup = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
}) => (
  <Wrapper>
    <Label>{label}:</Label>
    <Input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      error={error}
    />
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </Wrapper>
);

export default FormGroup;
