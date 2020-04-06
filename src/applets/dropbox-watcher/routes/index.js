const router = require('express').Router();
const nanoid = require('nanoid');

const { ensureLoggedIn } = require('../../../utils');
const { APPLET_ID, AUTH_URL, exchangeCodeForAccessToken } = require('../utils');
const userAppletsRepo = require('../../../repositories/userApplets');

router.get(
  '/applets/dropbox-watcher',
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
      res.render('dropbox-watcher/views/index', {
        AUTH_URL,
        userApplet
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/applets/dropbox-watcher/subscribe',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { code } = req.query;
      const { id: userId } = req.user;
      const identifier = nanoid(64);
      const {
        access_token: providerAccessToken,
        account_id: accountId,
        team_id: teamId
      } = await exchangeCodeForAccessToken(code);
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        configuration: JSON.stringify({ accountId, teamId }),
        identifier,
        providerAccessToken,
        userId
      });
      req.flash('success', 'You are subscribed to Dropbox watcher! Great!');
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/dropbox-watcher/unsubscribe/:identifier',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const { identifier } = req.params;
      await userAppletsRepo.findUserAppletByIdentifierAndUserId({
        identifier,
        userId
      });
      await userAppletsRepo.deleteUserAppletByIdentifier(identifier);
      req.flash(
        'success',
        'You just unsubscribed to Dropbox watcher applet. Too bad!'
      );
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
