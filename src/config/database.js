// note - this is a database connection module

// Sequelize is a modern TypeScript and Node.js ORM
// An ORM maps between an Object Model and a Relational Database

// note - We will have Object Definition in our code but
// Sequelize will be handling database connection, corresponding table creation & sql queries

// Define your models with ease and make optional use of automatic database synchronization
// Define associations between models and let Sequelize handle the heavy lifting
// Mark data as deleted instead of removing it once and for all from the database.
const Sequelize = require('sequelize');

const config = require('config');
const dbConfig = config.get('database');

// To connect to the database, you must create a Sequelize instance
// Passing parameters separately - ('database', 'username', 'password')
// const sequelize = new Sequelize('hoaxify', 'my-db-user', 'db-p4ssword', {
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  // database
  // dialect: 'sqlite',

  // storing database in the root dir
  // storage: './database.sqlite',

  // to turn off default logs in our test cases
  // logging: false,

  dialect: dbConfig.dialect,

  storage: dbConfig.storage,

  logging: dbConfig.logging,
});

// note - We set the NODE_ENV environment with cross-env dependency we installed in package.json
// For the test script we set the env to test, and for start script, we set the env as development.
// Based on this env, relevant config file is selected and app initialized with that configuration
// The sqlite database can run in memory.
// It is being initialized when the tests are running, and it is gone after the tests are ended.
module.exports = sequelize;
