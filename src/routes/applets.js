const router = require('express').Router();
const signInRequired = require('connect-ensure-login').ensureLoggedIn;

const providerBasedAppletsRepository = require('../repositories/applets/provider-based');
const scheduledBasedAppletsRepository = require('../repositories/applets/schedule-based');

router.post(
  '/applets/schedule-based/:id/subscribe',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id: userId, password } = req.user;
      const { _csrf, expression, ...config } = req.body;
      await scheduledBasedAppletsRepository.subscribeUserToScheduleBasedApplet(
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
      await scheduledBasedAppletsRepository.unsubscribeUserFromScheduleBasedApplet(
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

router.post(
  '/applets/provider-based/:id/subscribe',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const { _csrf, ...config } = req.body;
      await providerBasedAppletsRepository.subscribeUserToProviderBasedApplet(
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
  '/applets/provider-based/:id/unsubscribe',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      await providerBasedAppletsRepository.unsubscribeUserFromProviderBasedApplet(
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
