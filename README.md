# SOS Hasbik - Sistema de Gerenciamento de Animais

## 📋 Descrição
O SOS Hasbik é uma plataforma web desenvolvida para facilitar o gerenciamento e adoção de animais. O sistema permite que cidadãos e empresas se cadastrem e interajam com o propósito de ajudar animais em situação de vulnerabilidade.

## ✨ Funcionalidades

### 👤 Área do Cidadão
- Cadastro e login de usuários
- Visualização de animais disponíveis para adoção
- Registro de animais para adoção
- Gerenciamento de perfil

### 🏢 Área da Empresa
- Cadastro e login de empresas
- Gerenciamento de animais cadastrados
- Visualização de solicitações de adoção
- Gerenciamento de perfil empresarial

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - React.js
  - Styled Components
  - React Router DOM
  - Zod (Validação de formulários)

- **Backend:**
  - Supabase (Banco de dados e autenticação)
  - PostgreSQL

## 🚀 Como Executar o Projeto

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sos-hasbik.git
cd sos-hasbik
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Inicie o projeto:
```bash
npm run dev
```

## 📦 Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
├── pages/             # Páginas da aplicação
│   ├── login/        # Página de login
│   ├── cadastros/    # Páginas de cadastro
│   └── dashboard/    # Dashboard do usuário
├── utils/            # Funções utilitárias
├── lib/              # Configurações de bibliotecas
└── geral-components/ # Componentes gerais
```

## 🔒 Validação de Formulários

O projeto utiliza o Zod para validação de formulários, garantindo:

- Validação de CPF (11 dígitos)
- Validação de CNPJ (14 dígitos)
- Validação de email
- Validação de senha (mínimo 6 caracteres)
- Validação de telefone (10-11 dígitos)
- Validação de CEP (8 dígitos)
- Campos obrigatórios

## 🎨 Interface

- Design moderno e responsivo
- Feedback visual para erros de validação
- Mensagens de erro claras e em português
- Campos com foco visual quando há erro

## 🔐 Segurança

- Senhas armazenadas com hash
- Validação de dados no frontend e backend
- Proteção contra injeção SQL (Supabase)
- Autenticação segura

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
