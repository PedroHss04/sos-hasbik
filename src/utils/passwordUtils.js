import CryptoJS from 'crypto-js';

// Chave secreta para o hash (em um projeto real, isso deveria estar em variáveis de ambiente)
const SECRET_KEY = 'sos-hasbik-2024';

export const hashPassword = (password) => {
  // Cria um hash SHA-256 da senha usando a chave secreta
  return CryptoJS.HmacSHA256(password, SECRET_KEY).toString();
};

export const verifyPassword = (password, hashedPassword) => {
  // Verifica se a senha fornecida corresponde ao hash armazenado
  const hashedInput = hashPassword(password);
  return hashedInput === hashedPassword;
}; 