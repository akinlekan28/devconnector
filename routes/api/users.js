const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const mailer = require('sendgrid').mail;

//Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const validateResetInput = require('../../validation/reset');
const validateNewInput = require('../../validation/newpassword')

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

//@route  Post api/users/forgotpassword
//@desc Send resetpassword token
//@access Public

router.post('/forgotpassword', (req, res) => {

  const { errors, isValid } = validateResetInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        errors.email = 'User not found'
        return res.status(404).json(errors)
      }

      let token = Math.random().toString(20).substring(2, 15) + Math.random().toString(20).substring(2, 15);

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(token, salt, (err, hash) => {
          if (err) throw err;
          token = hash;

          const resetUser = new User({
            email: req.body.email,
            name: user.name,
            token: token,
            password: user.password,
            expiry: Date.now() + 86400000
          })
          resetUser.save()
            .then(user => {

              const fromEmail = new mailer.Email('no-reply@passwordreset.devconnector');
              const toEmail = new mailer.Email(user.email);
              const subject = 'Password Reset';
              const content = new mailer.Content('text/html', `
                  <html>
                      <head>
                        <title>Forget Password Email</title>
                      </head>
                   <body>
                      <div>
                          <h3>Dear ${user.name},</h3>
                          <p>You requested for a password reset on devconnector, kindly use this <a href="https://localhost:3000/resetpassword/${user.token}">link</a> to reset your password</p>
                          <br>
                          <p>Cheers!</p>
                      </div>
                   </body>

                  </html>
              `)
              const resetMsg = new mailer.Mail(fromEmail, subject, toEmail, content);
              const sender = require('sendgrid')(keys.sendGridKey);
              const request = sender.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: resetMsg.toJSON()
              });

              sender.API(request, (error, response) => {
                if (error) {
                  errors.email = 'Error sending password reset link'
                  return res.status(400).json(errors)
                }

                return res.status(200).json({ success: 'Password link sent successfully!' });

              })

            })
            .catch(err => console.log(err))
        })
      })
    })
    .catch(err => console.log(err));

});

//@route  Post api/users/forgotpassword
//@desc Reset user password
//@access Public

router.post('/resetpassword/:token', (req, res) => {
  User.findOne({ token: req.params.token })
    .then(user => {
      if (!user.token) {
        return res.status(404).json({ error: 'Password reset token not found or invalid!' })
      } else if (user.expiry < Date.now()) {
        return res.status(422).json({ error: 'Password reset token expired!' })
      }
      if (req.params.token === user.token) {
        const { errors, isValid } = validateNewInput(req.body);

        if (!isValid) {
          return res.status(400).json(errors);
        }

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err;
            req.body.password = hash;
            User.findOneAndUpdate({ email: user.email }, { password: req.body.password }, { name: user.name })
              .then(user => {
                res.status(200).json({ user, success: 'Password successfully changed!' })
              })
              .catch(err => console.log(err))
          })
        })
      } else {
        return res.status(400).json({ error: 'Password reset token does not match' })
      }
    })
    .catch(err => console.log(err))
});

module.exports = router;
