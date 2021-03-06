const router = require('express').Router();
const { nanoid } = require('nanoid');

const { ensureLoggedIn } = require('../../../utils');
const { countries } = require('../../shared/covid19-report/utils');
const cronJobRepo = require('../../../repositories/cronJob');
const appletsRepo = require('../../../repositories/applets');
const userAppletsRepo = require('../../../repositories/userApplets');

const APPLET_ID = 1;

router.get(
  '/applets/covid19-report-mail',
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
      res.render('covid19-report-mail/views/index', {
        applet,
        countries,
        userApplet,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/covid19-report-mail/subscribe',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { id: userId, timezone } = req.user;
      const { country, hour, minute } = req.body;
      const identifier = nanoid(64);
      const cronJobId = await cronJobRepo.createCronJob({
        expression: `${minute} ${hour} * * *`,
        httpMethod: 'POST',
        timezone,
        url: `https://ifttt.merys.eu/api/applets/covid19-report-mail/execute/${identifier}`,
      });
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        configuration: JSON.stringify({ country, cronJobId, hour, minute }),
        identifier,
        userId,
      });
      req.flash(
        'success',
        'You just subscribed to COVID 19 report applet. Nice!'
      );
      res.redirect('/applets/covid19-report-mail');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/covid19-report-mail/unsubscribe/:identifier',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const { identifier } = req.params;
      const {
        configuration,
      } = await userAppletsRepo.findUserAppletByIdentifierAndUserId({
        identifier,
        userId,
      });
      const { cronJobId } = JSON.parse(configuration);
      await cronJobRepo.deleteCronJobById(cronJobId);
      await userAppletsRepo.deleteUserAppletByIdentifier(identifier);
      req.flash(
        'success',
        'You just unsubscribed to COVID 19 report applet. Too bad!'
      );
      res.redirect('/applets/covid19-report-mail');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
