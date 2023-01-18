// note - this is a database connection module

// Define your models with ease and make optional use of automatic database synchronization
// Define associations between models and let Sequelize handle the heavy lifting
// Mark data as deleted instead of removing it once and for all from the database.
const Sequelize = require('sequelize');

// To connect to the database, you must create a Sequelize instance
// Passing parameters separately - ('database', 'username', 'password')
const sequelize = new Sequelize('hoaxify', 'my-db-user', 'db-p4ssword', {
  // database
  dialect: 'sqlite',
  // storing database in the root dir
  storage: './database.sqlite',

  // don't want to see in test cases
  logging: false,
});

module.exports = sequelize;
