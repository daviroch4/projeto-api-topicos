const { Projeto, Tarefa } = require('../models');
const AppError = require('../utils/AppError');

async function garantirProjeto(projetoId, usuarioId) {
  const projeto = await Projeto.findOne({ where: { id: projetoId, usuarioId } });
  if (!projeto) throw new AppError(404, 'Projeto não encontrado.');
  return projeto;
}

async function buscarTarefa(id, projetoId) {
  const tarefa = await Tarefa.findOne({ where: { id, projetoId } });
  if (!tarefa) throw new AppError(404, 'Tarefa não encontrada.');
  return tarefa;
}

exports.criar = async (req, res) => {
  await garantirProjeto(req.params.projetoId, req.usuarioId);
  const { titulo, descricao } = req.body || {};
  if (!titulo) throw new AppError(400, 'O título da tarefa é obrigatório.');
  const tarefa = await Tarefa.create({ titulo, descricao, projetoId: req.params.projetoId });
  res.status(201).json(tarefa);
};

exports.listar = async (req, res) => {
  await garantirProjeto(req.params.projetoId, req.usuarioId);
  res.json(await Tarefa.findAll({ where: { projetoId: req.params.projetoId } }));
};

exports.buscar = async (req, res) => {
  await garantirProjeto(req.params.projetoId, req.usuarioId);
  res.json(await buscarTarefa(req.params.id, req.params.projetoId));
};

exports.atualizar = async (req, res) => {
  await garantirProjeto(req.params.projetoId, req.usuarioId);
  const tarefa = await buscarTarefa(req.params.id, req.params.projetoId);
  const { titulo, descricao, concluida } = req.body || {};
  if (titulo !== undefined) tarefa.titulo = titulo;
  if (descricao !== undefined) tarefa.descricao = descricao;
  if (concluida !== undefined) {
    if (typeof concluida !== 'boolean') {
      throw new AppError(400, 'O campo concluida deve ser true ou false.');
    }
    tarefa.concluida = concluida;
  }
  await tarefa.save();
  res.json(tarefa);
};

exports.remover = async (req, res) => {
  await garantirProjeto(req.params.projetoId, req.usuarioId);
  const tarefa = await buscarTarefa(req.params.id, req.params.projetoId);
  await tarefa.destroy();
  res.status(204).send();
};