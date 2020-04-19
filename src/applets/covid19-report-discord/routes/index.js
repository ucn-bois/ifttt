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
      const { id: userId } = req.user;
      const identifier = nanoid(64);
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        userId,
        configuration: JSON.stringify({ country, hour, minute }),
        identifier
      });
      res.redirect(AUTH_URL);
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
        const { code } = req.query;
        response = await getAccessToken({ code });
      } catch (err) {
        const { error_description: errorDescription } = req.query;
        req.flash('error', errorDescription);
        res.redirect('/');
      }
      const { id: userId } = req.user;
      const userApplet = await userAppletsRepo.findUserAppletByAppletAndUserId({
        appletId: APPLET_ID,
        userId
      });
      let configuration = JSON.parse(userApplet.configuration);
      const cronJobId = await cronJobRepo.createCronJob({
        expression: `${configuration.minute} ${configuration.hour} * * *`,
        httpMethod: 'POST',
        url: `https://ifttt.merys.eu/api/applets/covid19-report-discord/execute/${userApplet.identifier}`
      });
      configuration = JSON.stringify({
        ...configuration,
        url: response.webhook.url,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expires: Date.now() + response.expires_in * 1000,
        cronJobId
      });
      await userAppletsRepo.updateConfigByIdentifier({
        identifier: userApplet.identifier,
        configuration
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
