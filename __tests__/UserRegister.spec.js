// HTTP assertions made easy via superagent, high-level abstraction for testing HTTP
const request = require('supertest');

const app = require('../src/app');

const UserModel = require('../src/models/UserModel');

const sequelize = require('../src/appConfig/database');

// Nodemailer-stub comes with a stub transport for Nodemailer to mock email service.
// The Stub stores the messages in memory but mimics real mail behaviour for testing.
const nodemailerStub = require('nodemailer-stub');

const EmailService = require('../src/email/EmailService');

// note - In Memory database is making it easier test setup parts. If we would use stored database, then we would have stale data coming from previous test runs. So we have to deal with those things like cleanup them etc. But with in memory db, we don't have to deal with those things because we know that db is just initialized with empty data.

// initialize db before all tests
beforeAll(() => {
  // async operation to initialize db
  return sequelize.sync();
});

beforeEach(() => {
  // removing user data from table before each test to avoid issues
  // like auto creating multiple users in db when all tests run
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

  it('returns size validation error when username is less than 4 characters', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'us1',
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    expect(response.body.validationErrors.username).toBe('Must be between 4 and 20 characters');
  });

  it('returns email validation error when email is not valid', async () => {
    const response = await request(app).post('/api/1.0/users').send({
      username: 'us1',
      email: 'user@mail',
      password: 'P4ssword',
    });

    expect(response.body.validationErrors.email).toBe('Email is not valid');
  });

  it('returns email validation error when same email is already in use', async () => {
    // first call
    await postValidUser();

    // query user table
    await UserModel.findAll().then((users) => {
      const savedUser = users[0];
      expect(savedUser.email).toBe('user1@mail.com');
    });

    // second call
    const response = await request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    expect(response.body.message).toBe('Email failure');
  });

  // it('returns `Password cannot be empty` message when password is null', async () => {
  //   const response = await request(app).post('/api/1.0/users').send({
  //     username: 'user1',
  //     email: 'user1@mail.com',
  //     password: null,
  //   });

  //   expect(response.body.validationErrors.password).toBe('Password cannot be empty');
  // });

  // note: dynamic tests with Jest, good practice for repeating tests to keep code DRY
  // it.each([
  //   // field, assertion
  //   ['password', 'Password cannot be empty'],
  //   ['password', 'Password must be at least 6 characters'],
  //   ['password', 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'],
  // ])('when %s is null, %s is received', async (field, expectedMessage) => {
  //   const user = {
  //     username: 'user1',
  //     email: 'user1@mail.com',
  //     password: 'hello',
  //   };

  //   user[field] = null;
  //   const response = await request(app).post('/api/1.0/users').send(user);
  //   const body = response.body;
  //   expect(body.validationErrors[field]).toBe(expectedMessage);
  // });

  // an alternative syntax for above with each table style
  it.each`
    field         | value              | expectedMessage
    ${'password'} | ${null}            | ${'Password cannot be empty'}
    ${'password'} | ${'hello'}         | ${'Password must be at least 6 characters'}
    ${'password'} | ${'alllowercase'}  | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'ALLUPPERCASE'}  | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'1234567'}       | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'lowerandUPPER'} | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'lowerand4667'}  | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'UPPER4667'}     | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
  `('returns $expectedMessage when $field is $value', async ({ field, value, expectedMessage }) => {
    const user = {
      username: 'user1',
      email: 'user1@mail.com',
      password: 'Password',
    };

    user[field] = value;
    const response = await request(app).post('/api/1.0/users').send(user);
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it('creates user in inactive mode on initial signup', async () => {
    await postValidUser();

    const users = await UserModel.findAll();
    const savedUser = users[0];
    expect(savedUser.inactive).toBe(true);
  });

  it('creates user in `inactive: true` on signup even the request body contains `inactive: false`', async () => {
    await request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@mail.com',
      password: 'P4ssword',
      inactive: false,
    });

    const users = await UserModel.findAll();
    const savedUser = users[0];
    expect(savedUser.inactive).toBe(true);
  });

  it('creates an activationToken for user', async () => {
    await postValidUser();

    const users = await UserModel.findAll();
    const savedUser = users[0];
    expect(savedUser.activationToken).toBeTruthy();
  });

  it('sends an Account activation email with activationToken', async () => {
    await postValidUser();

    // mail sent by nodemailer
    // note: 'interactsWithMail' class allows us to access, read, count and flush the messages in memory
    const lastMail = nodemailerStub.interactsWithMail.lastMail();
    // toContain when you want to check that an item is in an array
    // expect(lastMail.to).toContain('user1@mail.com');
    expect(lastMail.to[0]).toBe('user1@mail.com');

    const users = await UserModel.findAll();
    const savedUser = users[0];

    // note: In the mail content, there must be activation token
    expect(lastMail.content).toContain(savedUser.activationToken);
  });

  // 502 Bad Gateway error indicates that one server on the internet received an invalid response from another server. It's a generic error alerting you that there's something wrong with a website's server communication
  it('returns 502 Bad Gateway when sending email fails', async () => {
    await postValidUser();

    // jest.spyOn allows you to mock either the whole module or the individual functions of the module.
    // At its most general usage, it can be used to track calls on a method.
    const mockSendAccountActivationEmail = jest
      .spyOn(EmailService, 'sendAccountActivationEmail')
      // note: jest will be generating response object on this mock function
      .mockRejectedValue({ message: 'Failed to deliver email' });

    const response = await postValidUser();

    expect(response.status).toBe(502);

    // clear mock
    mockSendAccountActivationEmail.mockRestore();
  });

  it('returns Email failure message when sending email fails', async () => {
    await postValidUser();

    const mockSendAccountActivationEmail = jest
      .spyOn(EmailService, 'sendAccountActivationEmail')

      .mockRejectedValue({ message: 'Failed to deliver email' });

    const response = await postValidUser();

    mockSendAccountActivationEmail.mockRestore();

    expect(response.body.message).toBe('Email failure');
  });

  it.skip('does not save user to database if activation email fails', async () => {
    await postValidUser();

    const mockSendAccountActivationEmail = jest
      .spyOn(EmailService, 'sendAccountActivationEmail')

      .mockRejectedValue({ message: 'Failed to deliver email' });

    mockSendAccountActivationEmail.mockRestore();

    const users = await UserModel.findAll();

    expect(users.length).toBe(0);
  });
});
