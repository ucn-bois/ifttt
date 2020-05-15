const { body } = require('express-validator');
const authRepo = require('../../repositories/auth');
const { processValidationResults } = require('./index');

module.exports = ({
  blacklist = [],
  failureRedirect,
  key,
  persistOnFailure = true,
}) => [
  body('plainPassword').custom(async (plainPassword, { req})=>{
    const match = await authRepo.compareHashedPasswordWithPlainPassword({
      hashedPassword: req.user.password,
      plainPassword,
      shouldThrow: false,
    });
    if(!match){
      return Promise.reject('Wrong current password');
    }
  }),
  body('newPlainPassword')
    .matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])')
    .withMessage(
      'A password needs to have at least one number, one uppercase letter, one lowercase letter.'
    )
    .isLength({ max: 50, min: 8 })
    .withMessage('A password must be between 8 and 50 characters.'
    ),
  processValidationResults({
    blacklist,
    failureRedirect,
    key,
    persistOnFailure,
  }),
];
