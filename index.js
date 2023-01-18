const app = require('./src/app');

const sequelize = require('./src/config/database');

// initialize db
sequelize.sync();

// running app here in this module to listen only once
// this avoids listening again in our test cases
app.listen(9000, () => console.log('app is running!'));
