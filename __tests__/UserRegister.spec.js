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
  // removing user data from table before each test to avoid issues
  return UserModel.destroy({ truncate: true });
});

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
};

const postUser = (user = validUser) => {
  // app as a param
  return request(app).post('/api/1.0/users').send(user);
};

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

  it('returns success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe('User created');
  });

  it('saves the user to database', async () => {
    await postUser();

    const userList = await UserModel.findAll();
    expect(userList.length).toBe(1);

    // query user table
    // Search for multiple instances
    // UserModel.findAll().then((userList) => {
    //   expect(userList.length).toBe(1);
    //   done();
    // });
  });

  it('saves username and email to database', (done) => {
    postUser().then(() => {
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

  it('hashes the password in database', (done) => {
    postUser().then(() => {
      UserModel.findAll().then((userList) => {
        const savedUser = userList[0];
        expect(savedUser.password).not.toBe('P4ssword');

        done();
      });
    });
  });

  it('returns 400 when username is null', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    expect(response.status).toBe(400);
  });

  it('returns validationErrors field in response body when validation errors occurs', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    const body = response.body;
    expect(body.validationErrors).toBeDefined();
  });

  it('returns Username cannot be null when username is null', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    const body = response.body;
    expect(body.validationErrors.username).toBe('Username cannot be null');
  });

  it('returns Email cannot be null when email is null', async () => {
    const response = await postUser({
      username: 'user1',
      email: null,
      password: 'P4ssword',
    });

    const body = response.body;
    expect(body.validationErrors.email).toBe('Email cannot be null');
  });

  it('returns Errors for both when Username & Email is null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password: 'P4ssword',
    });

    const body = response.body;
    expect(body.validationErrors.username).toBe('Username cannot be null');
    expect(body.validationErrors.email).toBe('Email cannot be null');
    // expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });
});
