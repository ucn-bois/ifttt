const router = require('express').Router();
const signInRequired = require('connect-ensure-login').ensureLoggedIn;

const dropboxProvidersRepository = require('../../repositories/providers/dropbox');

router.get(
  '/providers/dropbox/authorize',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    const { state } = req.query;
    const [, providerId] = state.split(':');
    try {
      await dropboxProvidersRepository.connectProvider({
        code: req.query.code,
        providerId,
        userId: req.user.id
      });
      req.flash('success', 'You are connected! Great!');
      res.redirect('/providers');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
