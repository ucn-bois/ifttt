const router = require('express').Router();
const signInRequired = require('connect-ensure-login').ensureLoggedIn;

const githubProviderRepository = require('../../repositories/providers/github');

router.get(
  '/providers/github/authorize',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    const { code, state } = req.query;
    const [, providerId] = state.split(':');
    try {
      await githubProviderRepository.connectProvider({
        code,
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
