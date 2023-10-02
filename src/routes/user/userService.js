const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserModel = require('../../models/UserModel');
const { sendAccountActivationEmail } = require('../../email/EmailService');
const sequelize = require('../../appConfig/database');

const generateToken = (length) => {
  // random basic strings in hex format
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

const createUser = async (body) => {
  const { username, email, password } = body;

  // hash password - hash(data, salt, cb)
  const hash = await bcrypt.hash(password, 10);

  const user = { username, email, password: hash, activationToken: generateToken(16) };

  const transaction = await sequelize.transaction();

  // save user to db
  await UserModel.create(user, { transaction });

  try {
    // send email to activate account
    await sendAccountActivationEmail(email, user.activationToken);

    // store in db
    await transaction.commit();
  } catch (err) {
    // don't store in db
    await transaction.rollback();

    // throw new Error(err);
  }
};

const findByEmail = async (email) => {
  return await UserModel.findOne({ where: { email: email } });
};

module.exports = { createUser, findByEmail };
