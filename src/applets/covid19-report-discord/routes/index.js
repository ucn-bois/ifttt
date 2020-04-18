const router = require('express').Router();
const nanoid = require('nanoid');

const { ensureLoggedIn } = require('../../../utils');
const {
  APPLET_ID,
  AUTH_URL,
  getAccessToken,
  revokeToken,
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
        userApplet
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
  // TODO test this and then continue with accepting the scheduler's request and send a webhook out, then focus on removeWebhook()
  '/applets/covid19-report-discord/subscribe',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { code } = req.query;
      const { id: userId } = req.user;
      const userApplet = await userAppletsRepo.findUserAppletByAppletAndUserId({
        appletId: APPLET_ID,
        userId
      });
      await userAppletsRepo.deleteUserAppletByIdentifier(userApplet.identifier);
      const oldConfig = JSON.parse(userApplet.configuration);
      const response = await getAccessToken({ code });
      const cronJobId = await cronJobRepo.createCronJob({
        expression: `${oldConfig.minute} ${oldConfig.hour} * * *`,
        httpMethod: 'POST',
        url: `https://ifttt.merys.eu/api/applets/covid19-report-discord/execute/${userApplet.identifier}`
      });
      const configuration = JSON.stringify({
        country: oldConfig.country,
        hour: oldConfig.hour,
        minute: oldConfig.minute,
        url: response.webhook.url,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expires: Date.now() + response.expires_in * 1000,
        cronJobId
      });
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        userId,
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
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
