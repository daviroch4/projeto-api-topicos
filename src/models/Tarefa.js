const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tarefa = sequelize.define(
  'Tarefa',
  {
    titulo: { type: DataTypes.STRING, allowNull: false },
    descricao: { type: DataTypes.TEXT },
    concluida: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'tarefas' }
);

module.exports = Tarefa;