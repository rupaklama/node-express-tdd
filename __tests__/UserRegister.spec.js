// HTTP assertions made easy via superagent, high-level abstraction for testing HTTP
const request = require('supertest');

const app = require('../src/app');

const UserModel = require('../src/models/UserModel');

const sequelize = require('../src/appConfig/database');

// note - In Memory database is making it easier test setup parts. If we would use stored database, then we would have stale data coming from previous test runs. So we have to deal with those things like cleanup them etc. But with in memory db, we don't have to deal with those things because we know that db is just initialized with empty data.

// initialize db before all tests
beforeAll(() => {
  // async operation
  return sequelize.sync();
});

beforeEach(() => {
  // removing user data from table before each test to avoid issues
  return UserModel.destroy({ truncate: true });
});

describe('User Registration', () => {
  const postValidUser = () => {
    return request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@mail.com',
      password: 'P4ssword',
    });
  };

  it('returns 201 OK when signup request is valid', (done) => {
    postValidUser()
      // .expect(200, done);
      .then((response) => {
        expect(response.status).toBe(201);
        done();
      });
  });

  it('returns Success Message when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.body.message).toBe('User created!');
  });

  it('saves the user to database', async () => {
    await postValidUser();
    // query user table
    const users = await UserModel.findAll();
    expect(users.length).toBe(1);
  });

  it('saves the username and email to database', (done) => {
    postValidUser().then(() => {
      // query user table
      UserModel.findAll().then((users) => {
        const savedUser = users[0];
        expect(savedUser.username).toBe('user1');
        expect(savedUser.email).toBe('user1@mail.com');
        done();
      });
    });
  });

  it('hashes the password in database', async () => {
    await postValidUser();
    const users = await UserModel.findAll();
    const savedUser = users[0];
    expect(savedUser.password).not.toBe('P4ssword');
  });

  it('returns 400 when username is null', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    expect(response.status).toBe(400);
  });

  it('returns `validationErrors` field in response body when validation error occurs', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    expect(response.body.validationErrors).not.toBeUndefined();
  });

  it('returns `Username cannot be empty` when username is null', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    expect(response.body.validationErrors.username).toBe('Username cannot be empty');
  });

  it('returns `Email cannot be empty` when email is null', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: null,
      password: 'P4ssword',
    });

    expect(response.body.validationErrors.email).toBe('Email cannot be empty');
  });

  it('returns errors for both when username and email is null', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: null,
      email: null,
      password: 'P4ssword',
    });

    expect(response.body.validationErrors.username).toBe('Username cannot be empty');
    expect(response.body.validationErrors.email).toBe('Email cannot be empty');
  });
});
