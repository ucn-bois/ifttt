const router = require('express').Router();
const { nanoid } = require('nanoid');

const { ensureLoggedIn } = require('../../../utils');
const { APPLET_ID, authUrl, exchangeCodeForAccessToken } = require('../utils');
const appletsRepo = require('../../../repositories/applets');
const userAppletsRepo = require('../../../repositories/userApplets');
const cronJobRepo = require('../../../repositories/cronJob');

router.get(
  '/applets/weather-report-gsheet',
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
      res.render('weather-report-gsheet/views/index', {
        applet,
        authUrl,
        userApplet,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/weather-report-gsheet/subscribe',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const identifier = nanoid(64);
      const { city, gsheetUrl, hour, minute } = req.body;
      const cronJobId = await cronJobRepo.createCronJob({
        expression: `${minute} ${hour} * * *`,
        httpMethod: 'POST',
        // https://ifttt.merys.eu/
        url: `https://bc8e2c19.ngrok.io/api/applets/weather-report-gsheet/execute/${identifier}`,
      });
      const spreadsheetId = new RegExp('/spreadsheets/d/([a-zA-Z0-9-_]+)').exec(
        gsheetUrl
      )[1];
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        configuration: JSON.stringify({
          city,
          cronJobId,
          hour,
          minute,
          spreadsheetId,
        }),
        identifier,
        userId,
      });
      req.flash(
        'success',
        'Successfully subscribed to Google Sheet weather report.'
      );
      res.redirect('/applets/weather-report-gsheet');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/applets/weather-report-gsheet/subscribe/input',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { code } = req.query;
      await exchangeCodeForAccessToken(code);
      const { id: userId } = req.user;
      const applet = await appletsRepo.getAppletById(APPLET_ID);
      const userApplet = await userAppletsRepo.findUserAppletByAppletAndUserId({
        appletId: APPLET_ID,
        shouldThrow: false,
        userId,
      });
      res.render('weather-report-gsheet/views/input', {
        applet,
        userApplet,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/weather-report-gsheet/unsubscribe/:identifier',
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
        'Successfully unsubscribed from weather Google Sheet report.'
      );
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
