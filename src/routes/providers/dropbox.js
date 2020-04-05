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

router.get('/test', signInRequired('/sign-in'), async (req, res, next) => {
  try {
    const emails = await dropboxProvidersRepository.queryUserEmailsByDropboxAccountId(
      ['dbid:AABB3kNd1HN5-8qrySWrYUDECBggios3ncw']
    );
    console.log(emails);
    res.redirect('/providers');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
