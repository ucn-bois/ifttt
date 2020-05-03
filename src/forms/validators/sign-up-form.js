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
  body('plainPassword').custom((plainPassword, { req }) => {
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
