const { validationResult } = require('express-validator');

const mapErrorsToObject = (errorsArray) =>
  errorsArray.reduce((acc, { msg, param }) => {
    acc[param] = msg;
    return acc;
  }, {});

const persistFormValues = ({ blacklist, form }) => {
  // eslint-disable-next-line no-unused-vars
  const { _csrf, ...values } = form;
  if (!blacklist.length) {
    return values;
  }
  return Object.keys(values)
    .filter((key) => !blacklist.includes(key))
    .reduce((acc, key) => {
      acc[key] = values[key];
      return acc;
    }, {});
};

const processValidationResults = ({
  blacklist,
  failureRedirect,
  key,
  persistOnFailure,
}) => (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.session.forms[key] = {
      errors: mapErrorsToObject(errors.array()),
      values: persistOnFailure
        ? persistFormValues({ blacklist, form: req.body })
        : {},
    };
    return res.redirect(
      failureRedirect
        ? typeof failureRedirect === 'function'
          ? failureRedirect({ params: req.params, query: req.query, req })
          : failureRedirect
        : req.originalUrl
    );
  }
  next();
};

module.exports = {
  processValidationResults,
};
