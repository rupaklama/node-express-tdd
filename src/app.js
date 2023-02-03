const express = require('express');

const userRouter = require('./routes/user/userRoutes');

const app = express();

// Middleware to consume Request Body Object - default body parser package
app.use(express.json());

app.use(userRouter);

// console.log('env: ' + process.env.NODE_ENV);
// console.log(process.env);

// note - Not Listening our app here since avoiding port issues in out tests
// It's listening & running in index.js
module.exports = app;
