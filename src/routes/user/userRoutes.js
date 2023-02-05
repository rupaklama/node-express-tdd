const express = require('express');

const router = express.Router();

const { check, validationResult } = require('express-validator');

const userService = require('./userService');

// validator middleware
// const validateUsername = (req, res, next) => {
//   const user = req.body;

//   if (user.username === null) {
// adding & creating validationErrors object in request
//     req.validationErrors = {
//       username: 'Username cannot be null',
//     };
//   }

//   next();
// };

// const validateEmail = (req, res, next) => {
//   const user = req.body;

//   if (user.email === null) {
//     req.validationErrors = {
//       ...req.validationErrors,
//       email: 'Email cannot be null',
//     };
//   }

//   next();
// };

// check middleware is to check a string or array of field names to validate/sanitize
// validationResult middleware Extracts the validation errors of an express request
// withMessage middleware is to set custom error message
router.post(
  '/api/1.0/users',
  check('username').notEmpty().withMessage('Username cannot be null'),
  check('email').notEmpty().withMessage('Email cannot be null'),
  async (req, res) => {
    try {
      // if (req.validationErrors) {
      //   const response = { validationErrors: { ...req.validationErrors } };
      //   return res.status(400).send(response);
      // }

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const validationErrors = {};
        // accessing errors object array func
        errors.array().forEach((error) => (validationErrors[error.param] = error.msg));
        return res.status(400).send({ validationErrors: validationErrors });
      }

      // hash password - hash(data, salt, cb)
      // const hash = await bcrypt.hash(req.body.password, 10);

      // const user = { ...req.body, password: hash };

      // save user to db
      // await UserModel.create(user);
      await userService.save(req.body);

      // bcrypt.hash(req.body.password, 10).then((hash) => {
      //   const user = { ...req.body, password: hash };

      // const user = {
      //   username: req.body.username,
      //   email: req.body.email,
      //   password: hash,
      // };

      // save user to db
      //   UserModel.create(user).then(() => {
      //     return res.status(200).json({ message: 'User created' });
      //   });
      // });

      return res.status(200).json({ message: 'User created' });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  }
);

module.exports = router;
