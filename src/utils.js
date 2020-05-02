const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn(
  '/auth/sign-up'
);
const ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut('/');

const ensureVerified = (req, res, next) => {
  if (!req.user || (req.user && req.user.isVerified)) {
    return next();
  }
  res.redirect('/user/locked');
};

module.exports = {
  ensureLoggedIn,
  ensureLoggedOut,
  ensureVerified,
};
