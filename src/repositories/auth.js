const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { body, check, validationResult } = require('express-validator');

const { db } = require('../clients');

const compareHashedPasswordWithPlainPassword = async ({
  hashedPassword,
  plainPassword,
}) => {
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  if (!match) {
    throw createError(403, 'Provided password is incorrect.');
  }
};

const hashPassword = async (password) => await bcrypt.hash(password, 6);

const validateCredentials = [
  // email check - checks if an account exists with the provided email
  check('email')
    .isEmail()
    .withMessage('Invalid email format')
    .custom(async (email) => {
      const user = await db('users').where({ email }).first();
      if (user) {
        return Promise.reject('An account with this email already exists.');
      }
    }),
  // password check - checks if the password is between 8 - 50 characters and has at least one number and one letter
  check('plainPassword')
    .matches('^(?=.*[A-Za-z])(?=.*d)[A-Za-zd]')
    .withMessage(
      'A password needs to have at least one number and one letter and must be between 8 and 50 characters.'
    )
    .isLength({ min: 8, max: 50 })
    .withMessage(
      'A password must be between 8 and 50 characters and needs to have at least one number and one letter.'
    ),
  // repeated password check - checks if the provided passwords match
  body('repeatedPlainPassword')
    .custom((repeatedPassword, { req }) => {
      return repeatedPassword === req.body.plainPassword;
    })
    .withMessage('Passwords do not match.'),
];

const credValidationResult = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.array({ onlyFirstError: true })['0'].msg;
    throw createError(400, error);
  }
};

module.exports = {
  compareHashedPasswordWithPlainPassword,
  hashPassword,
  validateCredentials,
  credValidationResult,
};
