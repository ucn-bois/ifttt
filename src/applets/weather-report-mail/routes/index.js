const router = require('express').Router();
const nanoid = require('nanoid');

const { ensureLoggedIn } = require('../../../utils');
const { APPLET_ID } = require('../utils');
const userAppletsRepo = require('../../../repositories/userApplets');
const cronJobRepo = require('../../../repositories/cronJob');

router.get(
  '/applets/weather-report-mail',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      let userApplet;
      try {
        userApplet = await userAppletsRepo.findUserAppletByAppletAndUserId({
          appletId: APPLET_ID,
          userId
        });
      } catch (err) {
        // Well, there is nothing to do here.
      }
      res.render('weather-report-mail/views/index', { userApplet });
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
      const { hour, minute, city } = req.body;
      const cronJobId = await cronJobRepo.createCronJob({
        expression: `${minute} ${hour} * * *`,
        httpMethod: 'POST',
        url: `https://ifttt.merys.eu/api/applets/weather-report-mail/execute/${identifier}`
      });
      await userAppletsRepo.createUserApplet({
        configuration: JSON.stringify({ hour, minute, city, cronJobId }),
        userId,
        appletId: APPLET_ID,
        identifier
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
      await cronJobRepo.deleteCronJobById(cronJobId);
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
