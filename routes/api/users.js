const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//Load User Model
const User = require('../../models/User');


//@route  Get api/users/register
//@desc Register user route
//@access Public
router.post('/register', (req, res) => {

  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }


  User.findOne({
    email: req.body.email
  })
    .then(user => {
      if (user) {
        errors.email = 'Email already exists'
        return res.status(400).json(errors)
      } else {

        const avatar = gravatar.url(req.body.email, {
          s: '200',
          r: 'pg',
          d: 'mm'
        });

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        })

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err))
          })
        })
      }
    })
    .catch();
});

//@route  Get api/users/login
//@desc Login user route
//@access Public
router.post('/login', (req, res) => {

  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //Get User auth details
  User.findOne({
    email
  })
    .then(user => {
      //Check for user
      if (!user) {
        errors.email = 'User not found'
        return res.status(404).json(errors)
      }
      //Check password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            //User match
            const payload = { id: user.id, name: user.name, avatar: user.avatar } //Create JWT Payload

            //Sign token
            jwt.sign(
              payload,
              keys.secretKey,
              { expiresIn: 3600 },
              (e, token) => {
                res.json({
                  success: true,
                  token: 'Bearer ' + token
                })
              });
          } else {
            errors.password = 'Password incorrect';
            return res.status(400).json(errors)
          }
        })
    })
    .catch(err => console.log(err))
})

//@route  Get api/users/current
//@desc Returns current user route
//@access Private

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  })
})

module.exports = router;
