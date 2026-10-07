const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

let token;
let tokenOutro;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await request(app).post('/usuarios/registro').send({ nome: 'A', email: 'a@teste.com', senha: '123456' });
  await request(app).post('/usuarios/registro').send({ nome: 'B', email: 'b@teste.com', senha: '123456' });
  token = (await request(app).post('/usuarios/login').send({ email: 'a@teste.com', senha: '123456' })).body.token;
  tokenOutro = (await request(app).post('/usuarios/login').send({ email: 'b@teste.com', senha: '123456' })).body.token;
  await request(app).post('/projetos').set({ Authorization: `Bearer ${token}` }).send({ nome: 'P1' });
});

afterAll(async () => {
  await sequelize.close();
});

const auth = (t) => ({ Authorization: `Bearer ${t}` });

describe('Tarefas', () => {
  test('exige token', async () => {
    const res = await request(app).get('/projetos/1/tarefas');
    expect(res.status).toBe(401);
  });

  test('cria tarefa com 201', async () => {
    const res = await request(app).post('/projetos/1/tarefas').set(auth(token)).send({ titulo: 'T1' });
    expect(res.status).toBe(201);
    expect(res.body.concluida).toBe(false);
  });

  test('rejeita tarefa sem título com 400', async () => {
    const res = await request(app).post('/projetos/1/tarefas').set(auth(token)).send({});
    expect(res.status).toBe(400);
  });

  test('não cria tarefa em projeto inexistente ou de outro usuário (404)', async () => {
    const inexistente = await request(app).post('/projetos/999/tarefas').set(auth(token)).send({ titulo: 'X' });
    expect(inexistente.status).toBe(404);
    const alheio = await request(app).post('/projetos/1/tarefas').set(auth(tokenOutro)).send({ titulo: 'X' });
    expect(alheio.status).toBe(404);
  });

  test('lista tarefas do projeto', async () => {
    const res = await request(app).get('/projetos/1/tarefas').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('o projeto mostra suas tarefas (relacionamento)', async () => {
    const res = await request(app).get('/projetos/1').set(auth(token));
    expect(res.body.tarefas).toHaveLength(1);
    expect(res.body.tarefas[0].titulo).toBe('T1');
  });

  test('busca tarefa por id e devolve 404 se não existir', async () => {
    const ok = await request(app).get('/projetos/1/tarefas/1').set(auth(token));
    expect(ok.status).toBe(200);
    const nao = await request(app).get('/projetos/1/tarefas/999').set(auth(token));
    expect(nao.status).toBe(404);
  });

  test('atualiza tarefa e valida o campo concluida', async () => {
    const ok = await request(app).put('/projetos/1/tarefas/1').set(auth(token)).send({ concluida: true });
    expect(ok.status).toBe(200);
    expect(ok.body.concluida).toBe(true);
    const ruim = await request(app).put('/projetos/1/tarefas/1').set(auth(token)).send({ concluida: 'sim' });
    expect(ruim.status).toBe(400);
  });

  test('remove tarefa com 204 e depois devolve 404', async () => {
    const del = await request(app).delete('/projetos/1/tarefas/1').set(auth(token));
    expect(del.status).toBe(204);
    const res = await request(app).get('/projetos/1/tarefas/1').set(auth(token));
    expect(res.status).toBe(404);
  });
});