const express = require('express');

const router = express.Router();

const { check, validationResult } = require('express-validator');

const userService = require('./userService');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const UserModel = require('../../models/UserModel');

router.post(
  '/users',
  catchAsync(async (req, res, next) => {
    await UserModel.create(req.body);

    res.status(201).send({ message: 'User created!' });

    next();
  })
);

module.exports = router;
