const router = require('express').Router();
const signInRequired = require('connect-ensure-login').ensureLoggedIn;

const appletsRepository = require('../repositories/applets');

router.post(
  '/applets/:id/subscribe',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id: userId, password } = req.user;
      const { _csrf, expression, ...config } = req.body;
      await appletsRepository.subscribeUserToApplet(
        userId,
        id,
        JSON.stringify(config),
        expression,
        password
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
      await appletsRepository.unsubscribeUserFromApplet(id, userId);
      req.flash('success', 'You just got unsubscribed');
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
