const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserModel = require('../../models/UserModel');

const generateToken = (length) => {
  // random basic strings in hex format
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

const createUser = async (body) => {
  const { username, email, password } = body;

  // hash password - hash(data, salt, cb)
  const hash = await bcrypt.hash(password, 10);

  const user = { username, email, password: hash, activationToken: generateToken(16) };

  // save user to db
  await UserModel.create(user);
};

module.exports = { createUser };
