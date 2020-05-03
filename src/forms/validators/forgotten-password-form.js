const { body } = require('express-validator');

const { processValidationResults } = require('./index');

const usersRepo = require('../../repositories/users');

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
  processValidationResults({
    blacklist,
    failureRedirect,
    key,
    persistOnFailure,
  }),
];
