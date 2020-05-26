const router = require('express').Router();
const { nanoid } = require('nanoid');

<<<<<<< HEAD
=======
const validationForm = require('../validationForm');
<<<<<<< HEAD
const { convertTimeToUTC } = require('../../shared/timezone-converter');
>>>>>>> added timezone converter to discord covid applet
=======
>>>>>>> added timezones to scheduled applets
const { ensureLoggedIn } = require('../../../utils');
const { countries } = require('../../shared/covid19-report/utils');
const {
  APPLET_ID,
  AUTH_URL,
  getAccessToken,
  removeWebhook,
} = require('../utils');
const appletsRepo = require('../../../repositories/applets');
const userAppletsRepo = require('../../../repositories/userApplets');
const cronJobRepo = require('../../../repositories/cronJob');

router.get(
  '/applets/covid19-report-discord',
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
      res.render('covid19-report-discord/views/index', {
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
  '/applets/covid19-report-discord/authorize',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { country, hour, minute } = req.body;
      res.redirect(
        `${AUTH_URL}&state={"country":"${country}","hour":"${hour}","minute":"${minute}"}`
      );
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/applets/covid19-report-discord/subscribe',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      let response;
      try {
        // this block catches an error when the user cancels the authorization flow
        const { code } = req.query;
        response = await getAccessToken({ code });
      } catch (err) {
        const { error_description: errorDescription } = req.query;
        req.flash('error', errorDescription);
        return res.redirect('/');
      }
      const { state } = req.query;
      const { country, hour, minute } = JSON.parse(state);
      const { id: userId, timezone } = req.user;
      const identifier = nanoid(64);
      const cronJobId = await cronJobRepo.createCronJob({
<<<<<<< HEAD
<<<<<<< HEAD
        expression: `${minute} ${hour} * * *`,
        httpMethod: 'POST',
=======
        expression: `${convertedMinutes} ${convertedHours} * * *`,
        method: 'POST',
>>>>>>> added timezone converter to discord covid applet
=======
        expression: `${minute} ${hour} * * *`,
        httpMethod: 'POST',
        timezone,
>>>>>>> added timezones to scheduled applets
        url: `https://ifttt.merys.eu/api/applets/covid19-report-discord/execute/${identifier}`,
      });
      const configuration = JSON.stringify({
        accessToken: response.access_token,
        country,
        cronJobId,
        expires: Date.now() + response.expires_in * 1000,
        hour,
        minute,
        refreshToken: response.refresh_token,
        url: response.webhook.url,
      });
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        configuration,
        identifier,
        userId,
      });
      req.flash(
        'success',
        'Successfully subscribed to COVID-19 Discord report!'
      );
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/covid19-report-discord/unsubscribe/:identifier',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const userApplet = await userAppletsRepo.findUserAppletByIdentifier(
        identifier
      );
      const { cronJobId, url } = JSON.parse(userApplet.configuration);
      await removeWebhook(url);
      await cronJobRepo.deleteCronJobById(cronJobId);
      await userAppletsRepo.deleteUserAppletByIdentifier(identifier);
      req.flash(
        'success',
        'You just unsubscribed from COVID-19 Discord report!'
      );
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

// TODO nicer message formatting, country dropdown, display info about channel, country and time in applet home

module.exports = router;
