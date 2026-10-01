const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Projeto = require('./Projeto');
const Tarefa = require('./Tarefa');

Usuario.hasMany(Projeto, { foreignKey: 'usuarioId', as: 'projetos', onDelete: 'CASCADE' });
Projeto.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Projeto.hasMany(Tarefa, { foreignKey: 'projetoId', as: 'tarefas', onDelete: 'CASCADE' });
Tarefa.belongsTo(Projeto, { foreignKey: 'projetoId', as: 'projeto' });

module.exports = { sequelize, Usuario, Projeto, Tarefa };