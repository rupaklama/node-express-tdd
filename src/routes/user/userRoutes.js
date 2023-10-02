const express = require('express');

const router = express.Router();

const { check, validationResult } = require('express-validator');

const userService = require('./userService');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// Sanitization modifies the input to ensure that it is valid (such as removing white spaces).
// Validation checks if an input meets a set of criteria

router.post(
  '/users',

  [
    check('username')
      // note - usually we do Sanitization first
      .trim()
      .toLowerCase()
      // and then Validation
      .notEmpty()
      .withMessage('Username cannot be empty')
      .bail()
      .isLength({ min: 4, max: 20 })
      .withMessage('Must be between 4 and 20 characters'),

    check('email')
      .trim()
      .toLowerCase()
      .notEmpty()
      .withMessage('Email cannot be empty')
      .bail()
      .isEmail()
      .withMessage('Email is not valid'),
    check('password')
      .notEmpty()
      .withMessage('Password cannot be empty')
      .bail()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')

      .bail()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
      .withMessage('Password must have at least 1 uppercase, 1 lowercase letter and 1 number'),
  ],

  catchAsync(async (req, res, next) => {
    // const user = req.body;

    // if (user.username === null || user.email === null) {
    //   // Sending error & exiting from this middleware function
    //   // return next(new AppError('Please provide username!', 400));
    //   return res.status(400).send({
    //     validationErrors: {
    //       username: 'Username cannot be empty',
    //       email: 'Email cannot be empty',
    //     },
    //   });
    // }

    // 'validationResult' - Extracts the validation errors of an express request & returns it
    //  msg: 'Invalid value' - This is default error message set with validationResult
    // note - to customize the default message chain withMessage() in the validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationErrors = {};

      // array() - Gets the validation errors as an array
      errors.array().forEach((error) => (validationErrors[error.param] = error.msg));
      return res.status(400).send({ validationErrors: validationErrors });
    }

    try {
      await userService.createUser(req.body);

      res.status(201).send({ message: 'User created!' });
    } catch (err) {
      return res.status(400).send({
        validationErrors: {
          email: 'Email in use',
        },
      });
    }

    next();
  })
);

module.exports = router;
