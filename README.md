# API de Gerenciador de Tarefas

Projeto da disciplina **Tópicos Especiais em Desenvolvimento de Software II**.

API RESTful com autenticação JWT para gerenciar usuários, projetos e tarefas. Cada usuário enxerga e altera apenas os próprios projetos e as tarefas deles.

## Tecnologias

- Node.js e Express
- Sequelize (ORM) com SQLite
- JSON Web Token (`jsonwebtoken`) e `bcryptjs` para senhas
- Jest e Supertest para testes
- Swagger (`swagger-ui-express`) para a documentação

## Recursos e relacionamentos

- **usuarios**: registro, login (JWT) e CRUD.
- **projetos**: pertencem a um usuário.
- **tarefas**: pertencem a um projeto.

Relacionamentos: um usuário tem muitos projetos, e um projeto tem muitas tarefas. Ao buscar ou listar projetos, as tarefas de cada um já vêm dentro do campo `tarefas`. Também é possível listar as tarefas de um projeto em `GET /projetos/:projetoId/tarefas`.

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) (versão LTS) e Git.

```bash
git clone https://github.com/daviroch4/projeto-api-topicos.git
cd projeto-api-topicos
npm install
```

Crie um arquivo `.env` na raiz, baseado no `.env.example`:

```
PORT=3001
JWT_SECRET=uma_chave_grande_e_aleatoria
JWT_EXPIRES_IN=1d
```

Para gerar uma chave segura:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Inicie o servidor:

```bash
npm run dev
```

A API fica disponível em `http://localhost:3001`. O banco `database.sqlite` e as tabelas são criados automaticamente na primeira execução.

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta do servidor | `3001` |
| `JWT_SECRET` | Chave usada para assinar os tokens | `chave_secreta` |
| `JWT_EXPIRES_IN` | Validade do token | `1d` |

## Documentação (Swagger)

Com o servidor rodando, acesse: **http://localhost:3001/api-docs**

Para testar as rotas protegidas:

1. Faça login em `POST /usuarios/login` e copie o `token`.
2. Clique em **Authorize** e cole apenas o token (sem escrever `Bearer`).

O arquivo `requests.http` também traz exemplos de requisições para a extensão REST Client do VS Code.

## Autenticação

As rotas protegidas exigem o cabeçalho:

```
Authorization: Bearer <token>
```

## Endpoints

### Usuários

| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| POST | `/usuarios/registro` | pública | Registra um usuário |
| POST | `/usuarios/login` | pública | Autentica e devolve o token JWT |
| GET | `/usuarios` | JWT | Lista os usuários |
| GET | `/usuarios/:id` | JWT | Busca um usuário |
| PUT | `/usuarios/:id` | JWT | Atualiza o próprio usuário |
| DELETE | `/usuarios/:id` | JWT | Remove o próprio usuário |

### Projetos

| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| POST | `/projetos` | JWT | Cria um projeto |
| GET | `/projetos` | JWT | Lista os projetos do usuário (com tarefas) |
| GET | `/projetos/:id` | JWT | Busca um projeto (com tarefas) |
| PUT | `/projetos/:id` | JWT | Atualiza um projeto |
| DELETE | `/projetos/:id` | JWT | Remove um projeto e suas tarefas |

### Tarefas

| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| POST | `/projetos/:projetoId/tarefas` | JWT | Cria uma tarefa no projeto |
| GET | `/projetos/:projetoId/tarefas` | JWT | Lista as tarefas do projeto |
| GET | `/projetos/:projetoId/tarefas/:id` | JWT | Busca uma tarefa |
| PUT | `/projetos/:projetoId/tarefas/:id` | JWT | Atualiza uma tarefa |
| DELETE | `/projetos/:projetoId/tarefas/:id` | JWT | Remove uma tarefa |

## Exemplos

Registro:

```json
POST /usuarios/registro
{ "nome": "Maria", "email": "maria@teste.com", "senha": "123456" }
```

Login:

```json
POST /usuarios/login
{ "email": "maria@teste.com", "senha": "123456" }
```

Criar projeto e tarefa:

```json
POST /projetos
{ "nome": "Trabalho de API", "descricao": "Projeto da faculdade" }

POST /projetos/1/tarefas
{ "titulo": "Escrever os testes" }
```

## Tratamento de erros

Os erros seguem sempre o formato:

```json
{ "erro": "Mensagem explicando o problema." }
```

| Status | Quando acontece |
|---|---|
| 400 | Dados ausentes ou inválidos |
| 401 | Token ausente, inválido ou expirado; login incorreto |
| 403 | Tentativa de alterar ou remover outro usuário |
| 404 | Recurso ou rota não encontrados |
| 409 | E-mail já cadastrado |
| 500 | Erro interno do servidor |

## Testes

```bash
npm test
```

Os testes usam Jest e Supertest, com um banco SQLite em memória (não alteram o `database.sqlite`). Há um arquivo por recurso em `tests/`: `usuarios`, `projetos` e `tarefas`, com 30 testes no total.

## Estrutura

```
src/
  config/        conexão com o banco
  controllers/   lógica de cada recurso
  middlewares/   autenticação JWT e tratamento de erros
  models/        models do Sequelize e associações
  routes/        rotas por recurso
  docs/          especificação do Swagger
  utils/         classe de erro da aplicação
  app.js         configuração do Express
  server.js      inicialização do servidor
tests/           testes automatizados
```