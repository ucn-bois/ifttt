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
      return Promise.reject('Wrong current password');
    }
  }),
  body('newPlainPassword')
    .matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])')
    .isLength({ max: 50, min: 8 })
    .withMessage(
      'A password must be between 8 and 50 characters, have at least one upper-case letter, a lower-case letter and at least one number.'
    )
    .custom(async (newPlainPassword, { req }) => {
      console.log(req.user.password);
      const matching = await authRepo.compareHashedPasswordWithPlainPassword({
        hashedPassword: req.user.password,
        plainPassword: newPlainPassword,
        shouldThrow: false,
      });
      if (matching) {
        return Promise.reject('The new password is the same as the old.');
      }
    }),

  body('repeatedNewPlainPassword').custom(
    (repeatedNewPlainPassword, { req }) => {
      if (repeatedNewPlainPassword !== req.body.newPlainPassword) {
        return Promise.reject('Passwords do not match.');
      } else return true; //For some reason if I don't do this it creates an error that says "invalid value"
    }
  ),
  processValidationResults({
    blacklist,
    failureRedirect,
    key,
    persistOnFailure,
  }),
];
