const router = require('express').Router();
const nanoid = require('nanoid');

const { ensureLoggedIn } = require('../../../utils');
const cronJobRepo = require('../../../repositories/cronJob');
const userAppletsRepo = require('../../../repositories/userApplets');

const APPLET_ID = 1;

router.get(
  '/applets/covid19-report',
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
        // Do nothing. Continue.
      }
      res.render('covid19-report/views/', {
        userApplet
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/covid19-report/subscribe',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const { country, hour, minute } = req.body;
      const identifier = nanoid(64);
      const cronJobId = await cronJobRepo.createCronJob({
        expression: `${minute} ${hour} * * *`,
        httpMethod: 'POST',
        url: `https://ifttt.merys.eu/api/applets/covid19-report/execute/${identifier}`
      });
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        configuration: JSON.stringify({ country, hour, minute }),
        cronJobId,
        identifier,
        userId
      });
      req.flash(
        'success',
        'You just subscribed to COVID 19 report applet. Nice!'
      );
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/covid19-report/unsubscribe/:identifier',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const { identifier } = req.params;
      const {
        cronJobId
      } = await userAppletsRepo.findUserAppletByIdentifierAndUserId({
        identifier,
        userId
      });
      await cronJobRepo.deleteCronJobById(cronJobId);
      await userAppletsRepo.deleteUserAppletByIdentifier(identifier);
      req.flash(
        'success',
        'You just unsubscribed to COVID 19 report applet. Too bad!'
      );
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
