const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn(
  '/auth/sign-in'
);
const ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut('/');

module.exports = {
  ensureLoggedIn,
  ensureLoggedOut
};
