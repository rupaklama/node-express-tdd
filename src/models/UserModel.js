const Sequelize = require('sequelize');

// Sequelize instance to connect to db
const sequelize = require('../appConfig/database');

// Models are the essence of Sequelize.
// A model is an abstraction that represents a table in your database.
const Model = Sequelize.Model;

// In Sequelize, it is a class that extends Model.
class UserModel extends Model {}

// Initialize a model, representing a table in the DB, with attributes and options
UserModel.init(
  {
    // attributes
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
    },

    password: {
      type: Sequelize.STRING,
    },

    inactive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },

    activationToken: {
      type: Sequelize.STRING,
    },
  },
  {
    // options object
    // our sequelize instance
    sequelize,

    // table name
    modelName: 'users',
  }
);

module.exports = UserModel;
