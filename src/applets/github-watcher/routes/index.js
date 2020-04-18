const router = require('express').Router();
const nanoid = require('nanoid');

const { ensureLoggedIn } = require('../../../utils');
const {
  APPLET_ID,
  AUTH_URL,
  exchangeCodeForAccessToken,
  createWebhook,
  removeWebhook,
  validateRepoName
} = require('../utils');
const userAppletsRepo = require('../../../repositories/userApplets');

router.get(
  '/applets/github-watcher',
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
        // Do nothing? Okay.
      }
      res.render('github-watcher/views/index', {
        userApplet
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/github-watcher/authorize',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { repository } = req.body;
      validateRepoName(repository);
      res.redirect(`${AUTH_URL}/${repository}`);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/applets/github-watcher/subscribe/:owner/:repo',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { code } = req.query;
      const { owner, repo } = req.params;
      const repository = `${owner}/${repo}`;
      const { id: userId } = req.user;
      const identifier = nanoid(64);
      const { access_token: accessToken } = await exchangeCodeForAccessToken(
        code
      );
      const { id: hookId } = await createWebhook({
        repository,
        accessToken,
        identifier
      });
      await userAppletsRepo.createUserApplet({
        appletId: APPLET_ID,
        configuration: JSON.stringify({
          repository: repository,
          accessToken,
          hookId
        }),
        identifier,
        userId
      });
      req.flash(
        'success',
        'You are now subscribed to the GitHub commit watcher.'
      );
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/applets/github-watcher/unsubscribe/:identifier',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { config } = req.body;
      const { accessToken, repository, hookId } = JSON.parse(config);
      const { identifier } = req.params;
      await removeWebhook({ repository, hookId, accessToken });
      await userAppletsRepo.deleteUserAppletByIdentifier(identifier);
      req.flash(
        'success',
        "You just unsubscribed from GitHub watcher. It's sad to see you go."
      );
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;