const bcrypt = require('bcrypt');
const UserModel = require('../../models/UserModel');

const createUser = async (body) => {
  // hash password - hash(data, salt, cb)
  const hash = await bcrypt.hash(body.password, 10);

  const user = { ...body, password: hash };

  // save user to db
  await UserModel.create(user);
};

module.exports = { createUser };
