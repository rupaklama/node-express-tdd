const express = require('express');

const UserModel = require('./models/UserModel');

const app = express();

// Middleware to consume Request Body Object - default body parser package
app.use(express.json());

app.post('/api/1.0/users', (req, res) => {
  // save user to db
  UserModel.create(req.body).then(() => {
    return res.status(200).json({ message: 'User created' });
  });
});

module.exports = app;
