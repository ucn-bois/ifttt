const router = require('express').Router();
const signInRequired = require('connect-ensure-login').ensureLoggedIn;

const appletsRepository = require('../repositories/applets');

router.post(
  '/applets/:id/subscribe',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const { _csrf, ...config } = req.body;
      await appletsRepository.subscribeUserToApplet(
        userId,
        id,
        JSON.stringify(config)
      );
      req.flash('success', 'You just got subscribed');
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/:id/unsubscribe',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      await appletsRepository.unsubscribeUserFromApplet(userId, id);
      req.flash('success', 'You just got unsubscribed');
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/run/:token',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { token } = req.params;
      const { email } = req.user;
      await appletsRepository.runAppletWithToken(token, email);
      req.flash('success', 'Applet was run manually.');
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
