const createError = require('http-errors');
const { body } = require('express-validator');

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
    if (user) {
      return Promise.reject('User with such username already exists.');
    }
  }),
  body('email').custom(async (email) => {
    const user = await usersRepo.findUserByEmail({
      email,
      shouldThrow: false,
    });
    if (user) {
      return Promise.reject('User with such email already exists.');
    }
  }),
  body('plainPassword')
    .matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])')
    .withMessage(
      'A password needs to have at least one number, one uppercase letter, one lowercase letter.'
    )
    .isLength({ max: 50, min: 8 })
    .withMessage('A password must be between 8 and 50 characters.')
    .custom((plainPassword, { req }) => {
      if (plainPassword === req.body.repeatedPlainPassword) {
        return true;
      }
      throw createError('Passwords do not match.');
    }),
  processValidationResults({
    blacklist,
    failureRedirect,
    key,
    persistOnFailure,
  }),
];
