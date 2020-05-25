const { body } = require('express-validator');

const authRepo = require('../../repositories/auth');
const { processValidationResults } = require('./index');

module.exports = ({
  blacklist = [],
  failureRedirect,
  key,
  persistOnFailure = true,
}) => [
  body('plainPassword').custom(
    (plainPassword, { req }) =>
      authRepo.comparePlainPasswords({
        plainPassword,
        repeatedPlainPassword: req.body.repeatedPlainPassword,
      }) || true
  ),
  processValidationResults({
    blacklist,
    failureRedirect,
    key,
    persistOnFailure,
  }),
];
