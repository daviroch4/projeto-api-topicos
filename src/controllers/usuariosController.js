const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const AppError = require('../utils/AppError');

function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

function validarSenha(senha) {
  if (typeof senha !== 'string' || senha.length < 6) {
    throw new AppError(400, 'A senha deve ter pelo menos 6 caracteres.');
  }
}

exports.registrar = async (req, res) => {
  const { nome, email, senha } = req.body || {};
  if (!nome || !email || !senha) {
    throw new AppError(400, 'Nome, email e senha são obrigatórios.');
  }
  validarSenha(senha);

  const existente = await Usuario.findOne({ where: { email } });
  if (existente) throw new AppError(409, 'E-mail já cadastrado.');

  const hash = await bcrypt.hash(senha, 10);
  const usuario = await Usuario.create({ nome, email, senha: hash });

  res.status(201).json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
};

exports.login = async (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) throw new AppError(400, 'Email e senha são obrigatórios.');

  const usuario = await Usuario.unscoped().findOne({ where: { email } });
  const senhaOk = usuario && (await bcrypt.compare(senha, usuario.senha));
  if (!senhaOk) throw new AppError(401, 'Email ou senha incorretos.');

  res.json({
    token: gerarToken(usuario),
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
};

exports.listar = async (req, res) => {
  res.json(await Usuario.findAll());
};

exports.buscar = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new AppError(404, 'Usuário não encontrado.');
  res.json(usuario);
};

exports.atualizar = async (req, res) => {
  if (Number(req.params.id) !== req.usuarioId) {
    throw new AppError(403, 'Você só pode alterar o seu próprio usuário.');
  }
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new AppError(404, 'Usuário não encontrado.');

  const { nome, email, senha } = req.body || {};
  if (nome) usuario.nome = nome;
  if (email) usuario.email = email;
  if (senha) {
    validarSenha(senha);
    usuario.senha = await bcrypt.hash(senha, 10);
  }
  await usuario.save();

  res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
};

exports.remover = async (req, res) => {
  if (Number(req.params.id) !== req.usuarioId) {
    throw new AppError(403, 'Você só pode remover o seu próprio usuário.');
  }
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new AppError(404, 'Usuário não encontrado.');
  await usuario.destroy();
  res.status(204).send();
};