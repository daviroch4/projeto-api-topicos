const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

const dados = { nome: 'Davi', email: 'davi@teste.com', senha: '123456' };

async function logar(email = dados.email, senha = dados.senha) {
  const res = await request(app).post('/usuarios/login').send({ email, senha });
  return res.body.token;
}

describe('Usuários', () => {
  test('registra um usuário e não devolve a senha', async () => {
    const res = await request(app).post('/usuarios/registro').send(dados);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(dados.email);
    expect(res.body.senha).toBeUndefined();
  });

  test('rejeita e-mail duplicado com 409', async () => {
    const res = await request(app).post('/usuarios/registro').send(dados);
    expect(res.status).toBe(409);
  });

  test('rejeita registro sem campos obrigatórios com 400', async () => {
    const res = await request(app).post('/usuarios/registro').send({ nome: 'X' });
    expect(res.status).toBe(400);
  });

  test('rejeita senha curta com 400', async () => {
    const res = await request(app)
      .post('/usuarios/registro')
      .send({ nome: 'X', email: 'x@teste.com', senha: '123' });
    expect(res.status).toBe(400);
  });

  test('login devolve token JWT', async () => {
    const res = await request(app)
      .post('/usuarios/login')
      .send({ email: dados.email, senha: dados.senha });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('login com senha errada devolve 401', async () => {
    const res = await request(app)
      .post('/usuarios/login')
      .send({ email: dados.email, senha: 'errada123' });
    expect(res.status).toBe(401);
  });

  test('rota protegida sem token devolve 401', async () => {
    const res = await request(app).get('/usuarios');
    expect(res.status).toBe(401);
  });

  test('rota protegida com token inválido devolve 401', async () => {
    const res = await request(app).get('/usuarios').set('Authorization', 'Bearer abc');
    expect(res.status).toBe(401);
  });

  test('lista usuários com token válido', async () => {
    const token = await logar();
    const res = await request(app).get('/usuarios').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].senha).toBeUndefined();
  });

  test('busca usuário por id e devolve 404 se não existir', async () => {
    const token = await logar();
    const ok = await request(app).get('/usuarios/1').set('Authorization', `Bearer ${token}`);
    expect(ok.status).toBe(200);
    const naoExiste = await request(app).get('/usuarios/999').set('Authorization', `Bearer ${token}`);
    expect(naoExiste.status).toBe(404);
  });

  test('atualiza o próprio usuário', async () => {
    const token = await logar();
    const res = await request(app)
      .put('/usuarios/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Davi Rocha' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Davi Rocha');
  });

  test('não permite alterar ou remover outro usuário (403)', async () => {
    await request(app)
      .post('/usuarios/registro')
      .send({ nome: 'Outro', email: 'outro@teste.com', senha: '123456' });
    const token = await logar();
    const put = await request(app)
      .put('/usuarios/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Invasor' });
    expect(put.status).toBe(403);
    const del = await request(app).delete('/usuarios/2').set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(403);
  });

  test('remove o próprio usuário com 204', async () => {
    const token = await logar('outro@teste.com', '123456');
    const res = await request(app).delete('/usuarios/2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});