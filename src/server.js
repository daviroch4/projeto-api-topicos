const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, (erro) => {
  if (erro) {
    console.error('Erro ao iniciar o servidor:', erro.message);
    process.exit(1);
  }
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});