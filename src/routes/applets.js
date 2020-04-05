const router = require('express').Router();
const signInRequired = require('connect-ensure-login').ensureLoggedIn;

const appletsRepository = require('../repositories/applets/schedule-based');

router.post(
  '/applets/schedule-based/:id/subscribe',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id: userId, password } = req.user;
      const { _csrf, expression, ...config } = req.body;
      await appletsRepository.subscribeUserToScheduleBasedApplet(
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
  '/applets/schedule-based/:id/unsubscribe',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      await appletsRepository.unsubscribeUserFromScheduleBasedApplet(
        id,
        userId
      );
      req.flash('success', 'You just got unsubscribed');
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
