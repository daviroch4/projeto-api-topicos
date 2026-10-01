require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios');
const { rotaNaoEncontrada, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API funcionando' });
});

app.use('/usuarios', usuariosRoutes);

app.use(rotaNaoEncontrada);
app.use(errorHandler);

module.exports = app;