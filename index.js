const app = require('./src/app');

const sequelize = require('./src/config/database');

// initialize db
sequelize.sync();

// note - running app here in this module to listen only once
// this avoids listening again in our test cases
const server = app.listen(9000, () => console.log('app is running!'));

// note - global unhandled promise rejections, async code
// subscribing unhandled rejection object here
// The on() method requires name of the event to handle and callback function which is called when an event is raised.
process.on('unhandledRejection', (err) => {
  // The process.exit() method instructs Node.js to terminate the process synchronously with an exit status of code.
  // Node normally exits with a 0 status code when no more async operations are pending.

  // 0 is a success code and 1 (or another number) can be a failure code.
  // 0 will be used if nothing is specified, 1 will stop the current process
  console.log('unhandled rejection...shutting down');

  console.log(err.name, ':', err.message);

  server.close(() => {
    // doing this will give server some time to finish current tasks and handle current requests pending
    // Only after that the server will be shut down
    process.exit(1);
  });
});
