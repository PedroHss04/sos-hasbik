// Em um arquivo de utilitário, por exemplo, utils/validators.js
export const isValidCpf = (cpf) => {
  if (!cpf || typeof cpf !== "string") return false;
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  const calculateDigit = (slice) => {
    let sum = 0;
    let multiplier = slice.length + 1;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i]) * multiplier;
      multiplier--;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstNineDigits = cpf.substring(0, 9);
  const firstDigit = calculateDigit(firstNineDigits);

  if (parseInt(cpf[9]) !== firstDigit) return false;

  const firstTenDigits = cpf.substring(0, 10);
  const secondDigit = calculateDigit(firstTenDigits);

  return parseInt(cpf[10]) === secondDigit;
};

export const isValidCnpj = (cnpj) => {
  if (!cnpj || typeof cnpj !== "string") return false;
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;

  const calculateDigit = (slice, multipliers) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i]) * multipliers[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const multipliers1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const multipliers2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstTwelveDigits = cnpj.substring(0, 12);
  const firstDigit = calculateDigit(firstTwelveDigits, multipliers1);

  if (parseInt(cnpj[12]) !== firstDigit) return false;

  const firstThirteenDigits = cnpj.substring(0, 13);
  const secondDigit = calculateDigit(firstThirteenDigits, multipliers2);

  return parseInt(cnpj[13]) === secondDigit;
};
