const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  await sequelize.sync();
  app.listen(PORT, (erro) => {
    if (erro) {
      console.error('Erro ao iniciar o servidor:', erro.message);
      process.exit(1);
    }
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

iniciar();