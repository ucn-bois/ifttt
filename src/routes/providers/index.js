const router = require('express').Router();
const signInRequired = require('connect-ensure-login').ensureLoggedIn;

const providersRepository = require('../../repositories/providers');

router.get('/providers', signInRequired('/sign-in'), async (req, res, next) => {
  try {
    res.render('pages/providers', {
      providers: await providersRepository.getProvidersByUserId(req.user.id)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = [router, require('./dropbox'), require('./github')];
