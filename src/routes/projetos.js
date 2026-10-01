const express = require('express');
const projetos = require('../controllers/projetosController');
const tarefas = require('../controllers/tarefasController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.use(auth);

router.post('/', projetos.criar);
router.get('/', projetos.listar);
router.get('/:id', projetos.buscar);
router.put('/:id', projetos.atualizar);
router.delete('/:id', projetos.remover);

router.post('/:projetoId/tarefas', tarefas.criar);
router.get('/:projetoId/tarefas', tarefas.listar);
router.get('/:projetoId/tarefas/:id', tarefas.buscar);
router.put('/:projetoId/tarefas/:id', tarefas.atualizar);
router.delete('/:projetoId/tarefas/:id', tarefas.remover);

module.exports = router;