// high-level abstraction for testing HTTP
const request = require('supertest');

const app = require('../src/app');

const UserModel = require('../src/models/UserModel');

const sequelize = require('../src/config/database');

// initialize db before all tests
beforeAll(() => {
  // async operation
  return sequelize.sync();
});

beforeEach(() => {
  // removing user data from table before each test
  return UserModel.destroy({ truncate: true });
});

describe('User Registration', () => {
  it('returns 200 OK when signup request is valid', (done) => {
    // app as a param
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword',
      })
      .then((response) => {
        expect(response.status).toBe(200);

        done();
      });
    // .expect(200, done);
  });

  it('returns success message when signup request is valid', (done) => {
    // app as a param
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword',
      })
      .then((response) => {
        expect(response.body.message).toBe('User created');

        done();
      });
  });

  it('saves the user to database', (done) => {
    // app as a param
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword',
      })
      .then(() => {
        // query user table
        // Search for multiple instances
        UserModel.findAll().then((userList) => {
          expect(userList.length).toBe(1);
          done();
        });
      });
  });

  it('saves username and email to database', (done) => {
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword',
      })
      .then(() => {
        // query user table
        // Search for multiple instances
        UserModel.findAll().then((userList) => {
          // user object
          const savedUser = userList[0];
          expect(savedUser.username).toBe('user1');
          expect(savedUser.email).toBe('user1@mail.com');
          done();
        });
      });
  });
});
