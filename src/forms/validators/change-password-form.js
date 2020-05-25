const { body } = require('express-validator');

const authRepo = require('../../repositories/auth');
const { processValidationResults } = require('./index');

module.exports = ({
  blacklist = [],
  failureRedirect,
  key,
  persistOnFailure = true,
}) => [
  body('plainPassword').custom(async (plainPassword, { req }) => {
    const match = await authRepo.compareHashedPasswordWithPlainPassword({
      hashedPassword: req.user.password,
      plainPassword,
      shouldThrow: false,
    });
    if (!match) {
      return Promise.reject('Incorrect password.');
    }
  }),
  body('newPlainPassword')
    .matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])')
    .isLength({ max: 50, min: 8 })
    .withMessage(
      'A password must be between 8 and 50 characters, have at least one upper-case letter, a lower-case letter and at least one number.'
    ),
  body('repeatedNewPlainPassword').custom(
    (repeatedNewPlainPassword, { req }) =>
      authRepo.comparePlainPasswords({
        plainPassword: req.body.newPlainPassword,
        repeatedPlainPassword: repeatedNewPlainPassword,
      }) || true
  ),
  processValidationResults({
    blacklist,
    failureRedirect,
    key,
    persistOnFailure,
  }),
];
