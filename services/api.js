import express from "express";
import cors from "cors";
import { Client } from "pg";

const app = express();
const port = 3001;

// Configurar conexão com PostgreSQL
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "soshasbik",
  password: "22022005", // Ideal: mover isso para um .env
  port: 5432,
});

client
  .connect()
  .then(() => console.log("Conectado ao banco de dados"))
  .catch((err) => console.error("Erro de conexão", err.stack));

// Middlewares
app.use(cors()); // Permite que o frontend acesse a API
app.use(express.json()); // Para interpretar JSON no corpo das requisições

// Endpoint de login
app.post("/login", async (req, res) => {
  const { nome, senha } = req.body;

  try {
    const result = await client.query(
      "SELECT * FROM usuarios WHERE nome = $1 AND senha = $2",
      [nome, senha]
    );

    if (result.rows.length > 0) {
      res.json({ message: "Login bem-sucedido" });
    } else {
      res.status(401).json({ message: "Credenciais inválidas" });
    }
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Endpoint para listar usuários
app.get("/api/usuarios", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
