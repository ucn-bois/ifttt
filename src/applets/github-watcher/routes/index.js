const router = require('express').Router();

const { ensureLoggedIn } = require('../../../utils');
const { APPLET_ID, AUTH_URL, exchangeCodeForAccessToken } = require('../utils');
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
        // Do nothing. Continue.
      }
      res.render('github-watcher/views/index', {
        userApplet
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
