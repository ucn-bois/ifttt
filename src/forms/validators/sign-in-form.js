const { body } = require('express-validator');

const authRepo = require('../../repositories/auth');
const usersRepo = require('../../repositories/users');
const { processValidationResults } = require('./index');

module.exports = ({
  blacklist = [],
  failureRedirect,
  key,
  persistOnFailure = true,
}) => [
  body('username').custom(async (username) => {
    const user = await usersRepo.findUserByUsername({
      shouldThrow: false,
      username,
    });
    if (!user) {
      return Promise.reject('User with such username does not exist.');
    }
  }),
  body('password').custom(async (password, { req }) => {
    const user = await usersRepo.findUserByUsername({
      shouldThrow: false,
      username: req.body.username,
    });
    if (!user) {
      return Promise.resolve();
    }
    const match = await authRepo.compareHashedPasswordWithPlainPassword({
      hashedPassword: user.password,
      plainPassword: password,
    });
    if (!match) {
      return Promise.reject('Incorrect password.');
    }
  }),
  processValidationResults({
    blacklist,
    failureRedirect,
    key,
    persistOnFailure,
  }),
];
