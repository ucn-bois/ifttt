const createError = require('http-errors');
const { body } = require('express-validator');

const { processValidationResults } = require('./index');

module.exports = ({
  blacklist = [],
  failureRedirect,
  key,
  persistOnFailure = true,
}) => [
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
