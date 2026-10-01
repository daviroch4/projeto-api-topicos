const { Sequelize } = require('sequelize');

const emTeste = process.env.NODE_ENV === 'test';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: emTeste ? ':memory:' : 'database.sqlite',
  logging: false,
});

module.exports = sequelize;