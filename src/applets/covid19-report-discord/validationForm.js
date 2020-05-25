const { body } = require('express-validator');
const { processValidationResults } = require('../../forms/validators/index');

module.exports = ({
  blacklist = [],
  failureRedirect,
  key,
  persistOnFailure = true,
}) => [
  body('hour')
    .matches('(^[1-2][0-3]$)|^[0-9]$')
    .withMessage('Hours have to be from 0 to 23'),
  body('minute')
    .matches('^([0-5][0-9])$|^[0-9]$')
    .withMessage('Minutes have to be from 0 to 59'),
  processValidationResults({
    blacklist,
    failureRedirect,
    key,
    persistOnFailure,
  }),
];
