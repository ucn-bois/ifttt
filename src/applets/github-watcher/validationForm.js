const { body } = require('express-validator');
const { processValidationResults } = require('../../forms/validators/index');

module.exports = ({
  blacklist = [],
  failureRedirect,
  key,
  persistOnFailure = true,
}) => [
  body('repository')
    .matches('^[\\w\\-_]{1,70}/[\\w\\-_]{1,70}')
    .withMessage('Repository field format is username/repository-name'),

  processValidationResults({
    blacklist,
    failureRedirect,
    key,
    persistOnFailure,
  }),
];
