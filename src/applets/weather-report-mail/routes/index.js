const router = require('express').Router();
const { nanoid } = require('nanoid');

const { ensureLoggedIn } = require('../../../utils');
const { APPLET_ID } = require('../utils');
const appletsRepo = require('../../../repositories/applets');
const userAppletsRepo = require('../../../repositories/userApplets');
const cronJobRepo = require('../../../repositories/cronJob');

router.get(
  '/applets/weather-report-mail',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const applet = await appletsRepo.getAppletById(APPLET_ID);
      const userApplet = await userAppletsRepo.findUserAppletByAppletAndUserId({
        appletId: APPLET_ID,
        shouldThrow: false,
        userId,
      });
      res.render('weather-report-mail/views/index', { applet, userApplet });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/weather-report-mail/subscribe',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const identifier = nanoid(64);
      const { city, hour, minute } = req.body;
      const cronJobId = await cronJobRepo.createLocalCronJob({
        timeExpression: `${minute} ${hour} * * *`,
        url: `https://ifttt.merys.eu/api/applets/weather-report-mail/execute/${identifier}`,
      });
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        configuration: JSON.stringify({ city, cronJobId, hour, minute }),
        identifier,
        userId,
      });
      req.flash('success', 'Successfully subscribed to mail weather report.');
      res.redirect('/applets/weather-report-mail');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/weather-report-mail/unsubscribe/:identifier',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const userApplet = await userAppletsRepo.findUserAppletByIdentifier(
        identifier
      );
      const { cronJobId } = JSON.parse(userApplet.configuration);
      await userAppletsRepo.deleteUserAppletByIdentifier(identifier);
      await cronJobRepo.removeLocalCronJob(cronJobId);
      req.flash(
        'success',
        'Successfully unsubscribed from weather mail report.'
      );
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
