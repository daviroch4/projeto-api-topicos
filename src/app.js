require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const usuariosRoutes = require('./routes/usuarios');
const projetosRoutes = require('./routes/projetos');
const { rotaNaoEncontrada, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API funcionando' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);

app.use(rotaNaoEncontrada);
app.use(errorHandler);

module.exports = app;