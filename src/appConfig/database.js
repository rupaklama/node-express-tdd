// note - this is a database connection module

// Sequelize is a modern TypeScript and Node.js ORM
// An ORM maps between an Object Model and a Relational Database

// note - We will have Object Definition in our code but
// Sequelize will be handling database connection, corresponding table creation & sql queries

// Define your models with ease and make optional use of automatic database synchronization
// Define associations between models and let Sequelize handle the heavy lifting
// Mark data as deleted instead of removing it once and for all from the database.
const Sequelize = require('sequelize');

// env variables
const config = require('config');
// note: 'config' dependency by default looks in our root directory for folder/file - config
// If it is a folder, the dev env config file is in development.json
// and the test env config file is in test.json

// note - we will be using 'database.sqlite' module in development environment &
// using in-memory sqlite database for tests in test environment with th help of 'cross-env'
const dbConfig = config.get('database'); // database property in config object

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

// note - Test Environment
// The sqlite database can run in memory.
// It is being initialized when the tests are running, and it is gone after the tests are ended.
// Memory database is making it easier test setup parts. If we would use stored database, then we would have stale data coming from previous test runs. So we have to deal with those things like cleanup them etc. But with in memory db, we don't have to deal with those things because we know that db is just initialized with empty data.
module.exports = sequelize;
