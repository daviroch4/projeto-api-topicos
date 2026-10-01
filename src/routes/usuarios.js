const express = require('express');
const controller = require('../controllers/usuariosController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/registro', controller.registrar);
router.post('/login', controller.login);

router.get('/', auth, controller.listar);
router.get('/:id', auth, controller.buscar);
router.put('/:id', auth, controller.atualizar);
router.delete('/:id', auth, controller.remover);

module.exports = router;