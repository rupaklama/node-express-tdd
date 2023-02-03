const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const userService = require('./userService');

router.post('/api/1.0/users', async (req, res) => {
  try {
    await userService.save(req.body);

    // hash password - hash(data, salt, cb)
    // const hash = await bcrypt.hash(req.body.password, 10);

    // const user = { ...req.body, password: hash };

    // save user to db
    // await UserModel.create(user);

    return res.status(200).json({ message: 'User created' });

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

    // return res.send({ message: 'User created' });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
});

module.exports = router;
