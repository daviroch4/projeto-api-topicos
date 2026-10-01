const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function auth(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw new AppError(401, 'Token não informado. Use o cabeçalho Authorization: Bearer <token>.');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
    next();
  } catch {
    throw new AppError(401, 'Token inválido ou expirado.');
  }
}

module.exports = auth;