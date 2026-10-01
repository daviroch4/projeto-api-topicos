const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define(
  'Usuario',
  {
    nome: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: 'E-mail inválido.' } },
    },
    senha: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'usuarios',
    // a senha nunca sai nas consultas, a menos que use unscoped()
    defaultScope: { attributes: { exclude: ['senha'] } },
  }
);

module.exports = Usuario;