import { z } from "zod";
import { isValidCpf, isValidCnpj } from "./validators.js";
// Schema para validação de CPF
const cpfSchema = z
  .string()
  .length(11, "CPF deve ter 11 dígitos")
  .regex(/^\d+$/, "CPF deve conter apenas números")
  .refine(isValidCpf, {
    message: "CPF inválido",
  });

// Schema para validação de CNPJ
const cnpjSchema = z
  .string()
  .length(14, "CNPJ deve ter 14 dígitos")
  .regex(/^\d+$/, "CNPJ deve conter apenas números")
  .refine(isValidCnpj, {
    message: "CNPJ inválido",
  });

// Schema para validação de email
const emailSchema = z
  .string()
  .email("Email inválido")
  .min(1, "Email é obrigatório");

// Schema para validação de senha
const senhaSchema = z
  .string()
  .min(6, "A senha deve ter no mínimo 6 caracteres")
  .max(50, "A senha deve ter no máximo 50 caracteres");

// Schema para validação de telefone
const telefoneSchema = z
  .string()
  .min(10, "Telefone deve ter no mínimo 10 dígitos")
  .max(11, "Telefone deve ter no máximo 11 dígitos")
  .regex(/^\d+$/, "Telefone deve conter apenas números");

// Schema para validação de CEP
const cepSchema = z
  .string()
  .length(8, "CEP deve ter 8 dígitos")
  .regex(/^\d+$/, "CEP deve conter apenas números");

// Schema para validação de cadastro de cidadão
export const cadastroCidadaoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: cpfSchema,
  email: emailSchema,
  telefone: telefoneSchema,
  estado: z.string().min(1, "Estado é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  cep: cepSchema,
  endereco: z.string().min(1, "Endereço é obrigatório"),
  senha: senhaSchema,
});

// Schema para validação de cadastro de empresa
export const cadastroEmpresaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cnpj: cnpjSchema,
  email: emailSchema,
  telefone: telefoneSchema,
  estado: z.string().min(1, "Estado é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  cep: cepSchema,
  endereco: z.string().min(1, "Endereço é obrigatório"),
  senha: senhaSchema,
});

// Schema para validação de login
export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, "Senha é obrigatória"),
});
