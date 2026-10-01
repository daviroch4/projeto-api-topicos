const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Projeto = sequelize.define(
  'Projeto',
  {
    nome: { type: DataTypes.STRING, allowNull: false },
    descricao: { type: DataTypes.TEXT },
  },
  { tableName: 'projetos' }
);

module.exports = Projeto;