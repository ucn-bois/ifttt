const router = require('express').Router();
const nanoid = require('nanoid');

const { ensureLoggedIn } = require('../../../utils');
const { fetchCountries } = require('../../shared/covid19-report/utils');
const {
  APPLET_ID,
  AUTH_URL,
  getAccessToken,
  removeWebhook
} = require('../utils');
const userAppletsRepo = require('../../../repositories/userApplets');
const cronJobRepo = require('../../../repositories/cronJob');

router.get(
  '/applets/covid19-report-discord',
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
        // Continue without action
      }
      res.render('covid19-report-discord/views/index', {
        userApplet,
        countries: await fetchCountries()
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
        res.redirect('/');
      }
      const { state } = req.query;
      const { country, hour, minute } = JSON.parse(state);
      const { id: userId } = req.user;
      const identifier = nanoid(64);
      const cronJobId = await cronJobRepo.createCronJob({
        expression: `${minute} ${hour} * * *`,
        httpMethod: 'POST',
        url: `https://ifttt.merys.eu/api/applets/covid19-report-discord/execute/${userApplet.identifier}`
      });
      const configuration = JSON.stringify({
        country,
        hour,
        minute,
        url: response.webhook.url,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expires: Date.now() + response.expires_in * 1000,
        cronJobId
      });
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        userId,
        configuration,
        identifier
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
      const { url, cronJobId } = JSON.parse(userApplet.configuration);
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
