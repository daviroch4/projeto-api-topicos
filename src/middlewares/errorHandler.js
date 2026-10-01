const AppError = require('../utils/AppError');

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: `Rota ${req.method} ${req.originalUrl} não existe.` });
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ erro: err.errors.map((e) => e.message).join(' ') });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ erro: 'Registro duplicado.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = { rotaNaoEncontrada, errorHandler };