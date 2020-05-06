const router = require('express').Router();
const { nanoid } = require('nanoid');

const { ensureLoggedIn } = require('../../../utils');
const { APPLET_ID } = require('../utils');
const appletsRepo = require('../../../repositories/applets');
const userAppletsRepo = require('../../../repositories/userApplets');

router.get('/applets/greeting', ensureLoggedIn, async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const applet = await appletsRepo.getAppletById(APPLET_ID);
    const userApplet = await userAppletsRepo.findUserAppletByAppletAndUserId({
      appletId: APPLET_ID,
      shouldThrow: false,
      userId,
    });
    res.render('greeting/views/index', {
      applet,
      userApplet,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/applets/greeting/subscribe',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const { greeting } = req.body;
      const identifier = nanoid(64);
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        configuration: JSON.stringify({ greeting }),
        identifier,
        userId,
      });
      req.flash(
        'success',
        'You are now subscribed to the greeting applet. Yay!'
      );
      res.redirect('/applets/greeting');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/greeting/unsubscribe/:identifier',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      await userAppletsRepo.deleteUserAppletByIdentifier(identifier);
      req.flash(
        'success',
        "You just unsubscribed from greeting applet. It's sad to see you go."
      );
      res.redirect('/applets/greeting');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/applets/greeting/execute/:identifier',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const { id: userId } = req.user;
      const {
        configuration,
      } = await userAppletsRepo.findUserAppletByIdentifierAndUserId({
        identifier,
        userId,
      });
      const { greeting } = JSON.parse(configuration);
      console.log(greeting);
      req.flash('success', 'You just said hello to our server! Thank you :)');
      res.redirect('/applets/greeting');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
