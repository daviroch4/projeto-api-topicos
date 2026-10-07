const refErro = { $ref: '#/components/schemas/Erro' };

const resposta = (descricao, schema) => ({
  description: descricao,
  content: { 'application/json': { schema } },
});

const erro = (descricao) => resposta(descricao, refErro);

const idPath = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer' },
};

const projetoIdPath = {
  name: 'projetoId',
  in: 'path',
  required: true,
  schema: { type: 'integer' },
};

const corpo = (schema) => ({
  required: true,
  content: { 'application/json': { schema } },
});

const protegida = [{ bearerAuth: [] }];

const erro401 = erro('Token não informado, inválido ou expirado');

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'API de Gerenciador de Tarefas',
    version: '1.0.0',
    description:
      'API RESTful com usuários (JWT), projetos e tarefas. Faça login em /usuarios/login, copie o token e clique em "Authorize".',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Usuários' },
    { name: 'Projetos' },
    { name: 'Tarefas' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Erro: {
        type: 'object',
        properties: { erro: { type: 'string', example: 'Mensagem de erro' } },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Davi' },
          email: { type: 'string', example: 'davi@teste.com' },
        },
      },
      Tarefa: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          titulo: { type: 'string', example: 'Escrever os testes' },
          descricao: { type: 'string', nullable: true },
          concluida: { type: 'boolean', example: false },
          projetoId: { type: 'integer', example: 1 },
        },
      },
      Projeto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Trabalho de API' },
          descricao: { type: 'string', nullable: true },
          usuarioId: { type: 'integer', example: 1 },
          tarefas: { type: 'array', items: { $ref: '#/components/schemas/Tarefa' } },
        },
      },
      RegistroEntrada: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', example: 'Davi' },
          email: { type: 'string', example: 'davi@teste.com' },
          senha: { type: 'string', example: '123456', description: 'Mínimo de 6 caracteres' },
        },
      },
      LoginEntrada: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', example: 'davi@teste.com' },
          senha: { type: 'string', example: '123456' },
        },
      },
      LoginSaida: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          usuario: { $ref: '#/components/schemas/Usuario' },
        },
      },
      UsuarioAtualizar: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          email: { type: 'string' },
          senha: { type: 'string' },
        },
      },
      ProjetoEntrada: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: { type: 'string', example: 'Trabalho de API' },
          descricao: { type: 'string', example: 'Projeto da faculdade' },
        },
      },
      TarefaEntrada: {
        type: 'object',
        required: ['titulo'],
        properties: {
          titulo: { type: 'string', example: 'Escrever os testes' },
          descricao: { type: 'string' },
        },
      },
      TarefaAtualizar: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          descricao: { type: 'string' },
          concluida: { type: 'boolean' },
        },
      },
    },
  },
  paths: {
    '/usuarios/registro': {
      post: {
        tags: ['Usuários'],
        summary: 'Registra um novo usuário',
        requestBody: corpo({ $ref: '#/components/schemas/RegistroEntrada' }),
        responses: {
          201: resposta('Usuário criado', { $ref: '#/components/schemas/Usuario' }),
          400: erro('Dados inválidos'),
          409: erro('E-mail já cadastrado'),
        },
      },
    },
    '/usuarios/login': {
      post: {
        tags: ['Usuários'],
        summary: 'Autentica o usuário e devolve um token JWT',
        requestBody: corpo({ $ref: '#/components/schemas/LoginEntrada' }),
        responses: {
          200: resposta('Login realizado', { $ref: '#/components/schemas/LoginSaida' }),
          400: erro('Email ou senha não informados'),
          401: erro('Email ou senha incorretos'),
        },
      },
    },
    '/usuarios': {
      get: {
        tags: ['Usuários'],
        summary: 'Lista os usuários',
        security: protegida,
        responses: {
          200: resposta('Lista de usuários', {
            type: 'array',
            items: { $ref: '#/components/schemas/Usuario' },
          }),
          401: erro401,
        },
      },
    },
    '/usuarios/{id}': {
      get: {
        tags: ['Usuários'],
        summary: 'Busca um usuário por id',
        security: protegida,
        parameters: [idPath],
        responses: {
          200: resposta('Usuário encontrado', { $ref: '#/components/schemas/Usuario' }),
          401: erro401,
          404: erro('Usuário não encontrado'),
        },
      },
      put: {
        tags: ['Usuários'],
        summary: 'Atualiza o próprio usuário',
        security: protegida,
        parameters: [idPath],
        requestBody: corpo({ $ref: '#/components/schemas/UsuarioAtualizar' }),
        responses: {
          200: resposta('Usuário atualizado', { $ref: '#/components/schemas/Usuario' }),
          400: erro('Dados inválidos'),
          401: erro401,
          403: erro('Só é possível alterar o próprio usuário'),
          404: erro('Usuário não encontrado'),
        },
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Remove o próprio usuário',
        security: protegida,
        parameters: [idPath],
        responses: {
          204: { description: 'Usuário removido' },
          401: erro401,
          403: erro('Só é possível remover o próprio usuário'),
          404: erro('Usuário não encontrado'),
        },
      },
    },
    '/projetos': {
      post: {
        tags: ['Projetos'],
        summary: 'Cria um projeto',
        security: protegida,
        requestBody: corpo({ $ref: '#/components/schemas/ProjetoEntrada' }),
        responses: {
          201: resposta('Projeto criado', { $ref: '#/components/schemas/Projeto' }),
          400: erro('Dados inválidos'),
          401: erro401,
        },
      },
      get: {
        tags: ['Projetos'],
        summary: 'Lista os projetos do usuário logado (com suas tarefas)',
        security: protegida,
        responses: {
          200: resposta('Lista de projetos', {
            type: 'array',
            items: { $ref: '#/components/schemas/Projeto' },
          }),
          401: erro401,
        },
      },
    },
    '/projetos/{id}': {
      get: {
        tags: ['Projetos'],
        summary: 'Busca um projeto por id, já com suas tarefas',
        security: protegida,
        parameters: [idPath],
        responses: {
          200: resposta('Projeto encontrado', { $ref: '#/components/schemas/Projeto' }),
          401: erro401,
          404: erro('Projeto não encontrado'),
        },
      },
      put: {
        tags: ['Projetos'],
        summary: 'Atualiza um projeto',
        security: protegida,
        parameters: [idPath],
        requestBody: corpo({ $ref: '#/components/schemas/ProjetoEntrada' }),
        responses: {
          200: resposta('Projeto atualizado', { $ref: '#/components/schemas/Projeto' }),
          401: erro401,
          404: erro('Projeto não encontrado'),
        },
      },
      delete: {
        tags: ['Projetos'],
        summary: 'Remove um projeto e suas tarefas',
        security: protegida,
        parameters: [idPath],
        responses: {
          204: { description: 'Projeto removido' },
          401: erro401,
          404: erro('Projeto não encontrado'),
        },
      },
    },
    '/projetos/{projetoId}/tarefas': {
      post: {
        tags: ['Tarefas'],
        summary: 'Cria uma tarefa no projeto',
        security: protegida,
        parameters: [projetoIdPath],
        requestBody: corpo({ $ref: '#/components/schemas/TarefaEntrada' }),
        responses: {
          201: resposta('Tarefa criada', { $ref: '#/components/schemas/Tarefa' }),
          400: erro('Dados inválidos'),
          401: erro401,
          404: erro('Projeto não encontrado'),
        },
      },
      get: {
        tags: ['Tarefas'],
        summary: 'Lista as tarefas do projeto',
        security: protegida,
        parameters: [projetoIdPath],
        responses: {
          200: resposta('Lista de tarefas', {
            type: 'array',
            items: { $ref: '#/components/schemas/Tarefa' },
          }),
          401: erro401,
          404: erro('Projeto não encontrado'),
        },
      },
    },
    '/projetos/{projetoId}/tarefas/{id}': {
      get: {
        tags: ['Tarefas'],
        summary: 'Busca uma tarefa do projeto',
        security: protegida,
        parameters: [projetoIdPath, idPath],
        responses: {
          200: resposta('Tarefa encontrada', { $ref: '#/components/schemas/Tarefa' }),
          401: erro401,
          404: erro('Projeto ou tarefa não encontrados'),
        },
      },
      put: {
        tags: ['Tarefas'],
        summary: 'Atualiza uma tarefa',
        security: protegida,
        parameters: [projetoIdPath, idPath],
        requestBody: corpo({ $ref: '#/components/schemas/TarefaAtualizar' }),
        responses: {
          200: resposta('Tarefa atualizada', { $ref: '#/components/schemas/Tarefa' }),
          400: erro('Dados inválidos'),
          401: erro401,
          404: erro('Projeto ou tarefa não encontrados'),
        },
      },
      delete: {
        tags: ['Tarefas'],
        summary: 'Remove uma tarefa',
        security: protegida,
        parameters: [projetoIdPath, idPath],
        responses: {
          204: { description: 'Tarefa removida' },
          401: erro401,
          404: erro('Projeto ou tarefa não encontrados'),
        },
      },
    },
  },
};

module.exports = spec;