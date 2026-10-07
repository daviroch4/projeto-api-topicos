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
});

afterAll(async () => {
  await sequelize.close();
});

const auth = (t) => ({ Authorization: `Bearer ${t}` });

describe('Projetos', () => {
  test('exige token', async () => {
    const res = await request(app).get('/projetos');
    expect(res.status).toBe(401);
  });

  test('cria projeto com 201', async () => {
    const res = await request(app).post('/projetos').set(auth(token)).send({ nome: 'P1', descricao: 'desc' });
    expect(res.status).toBe(201);
    expect(res.body.nome).toBe('P1');
  });

  test('rejeita projeto sem nome com 400', async () => {
    const res = await request(app).post('/projetos').set(auth(token)).send({});
    expect(res.status).toBe(400);
  });

  test('lista apenas os projetos do usuário', async () => {
    const meus = await request(app).get('/projetos').set(auth(token));
    expect(meus.status).toBe(200);
    expect(meus.body).toHaveLength(1);
    const dele = await request(app).get('/projetos').set(auth(tokenOutro));
    expect(dele.body).toHaveLength(0);
  });

  test('busca projeto por id e devolve 404 se não existir', async () => {
    const ok = await request(app).get('/projetos/1').set(auth(token));
    expect(ok.status).toBe(200);
    expect(Array.isArray(ok.body.tarefas)).toBe(true);
    const nao = await request(app).get('/projetos/999').set(auth(token));
    expect(nao.status).toBe(404);
  });

  test('outro usuário não enxerga o projeto (404)', async () => {
    const res = await request(app).get('/projetos/1').set(auth(tokenOutro));
    expect(res.status).toBe(404);
  });

  test('atualiza projeto', async () => {
    const res = await request(app).put('/projetos/1').set(auth(token)).send({ nome: 'P1 editado' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('P1 editado');
  });

  test('remove projeto com 204 e depois devolve 404', async () => {
    const del = await request(app).delete('/projetos/1').set(auth(token));
    expect(del.status).toBe(204);
    const res = await request(app).get('/projetos/1').set(auth(token));
    expect(res.status).toBe(404);
  });
});