const express = require('express');

const userRouter = require('./routes/user/userRoutes');
const AppError = require('./utils/appError');

const app = express();

// Middleware to consume Request Body Object - default body parser package
app.use(express.json());

// ROUTES
// app.get('/', (req, res) => {
//   res.status(200).send('welcome');
// });

app.use('/api/1.0', userRouter);

// NODE_ENV is automatically set & detected based on the current environment like dev, test or prod
// It is very helpful on setting configurations & application logic based on the NODE_ENV variable
console.log('env config: ' + process.env.NODE_ENV);
// note - we will be using 'database.sqlite' module in development environment &
// using in-memory sqlite database for tests in test environment

// NOTE: cross-env
// We set the environment with 'cross-env' dependency.
// For the test script we set the env to 'test', and for start script, we set the env as 'development'.
// Based on this env, relevant config file is selected with 'config' package
// and app is initialized with that configuration.

// Global Unhandled routes for ALL HTTP methods
// note - this MUST come after all the Route Handles, set to the end
app.all('*', (req, res, next) => {
  // creating error object with msg & defining the status, statusCode
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;

  // note - when next() receives any argument, express will know automatically there is an error
  // it will skip all the middleware in the middleware stacks & send error into global error handling middleware
  next(err);
  // next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// NOTE - Global Operational Error handling middleware
// handling all Operation Errors in one place
app.use((err, req, res, next) => {
  // stack trace are details where the error occurred
  // console.log(err.stack);

  // default status code & status message defined above in global unhandled routes
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      // print entire error
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === 'production') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  next();
});

// note - Not Listening our app here since avoiding port issues in out tests
// It's listening & running in index.js
module.exports = app;
