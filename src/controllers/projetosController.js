const { Projeto, Tarefa } = require('../models');
const AppError = require('../utils/AppError');

async function buscarProjetoDoUsuario(id, usuarioId) {
  const projeto = await Projeto.findOne({
    where: { id, usuarioId },
    include: [{ model: Tarefa, as: 'tarefas' }],
  });
  if (!projeto) throw new AppError(404, 'Projeto não encontrado.');
  return projeto;
}

exports.criar = async (req, res) => {
  const { nome, descricao } = req.body || {};
  if (!nome) throw new AppError(400, 'O nome do projeto é obrigatório.');
  const projeto = await Projeto.create({ nome, descricao, usuarioId: req.usuarioId });
  res.status(201).json(projeto);
};

exports.listar = async (req, res) => {
  const projetos = await Projeto.findAll({
    where: { usuarioId: req.usuarioId },
    include: [{ model: Tarefa, as: 'tarefas' }],
  });
  res.json(projetos);
};

exports.buscar = async (req, res) => {
  res.json(await buscarProjetoDoUsuario(req.params.id, req.usuarioId));
};

exports.atualizar = async (req, res) => {
  const projeto = await buscarProjetoDoUsuario(req.params.id, req.usuarioId);
  const { nome, descricao } = req.body || {};
  if (nome !== undefined) projeto.nome = nome;
  if (descricao !== undefined) projeto.descricao = descricao;
  await projeto.save();
  res.json(projeto);
};

exports.remover = async (req, res) => {
  const projeto = await buscarProjetoDoUsuario(req.params.id, req.usuarioId);
  await projeto.destroy();
  res.status(204).send();
};