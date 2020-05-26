const router = require('express').Router();
const moment = require('moment-timezone');

const { ensureLoggedIn, ensureVerified } = require('../utils');
const appletsRepo = require('../repositories/applets');
const { popForm } = require('../forms');

router.get('/', [ensureLoggedIn, ensureVerified], async (req, res, next) => {
  try {
    const { id: userId, timezone } = req.user;
    const applets = await appletsRepo.getApplets(userId);
    res.render('pages/browse-apps', {
      applets: applets,
      changeEmailForm: popForm({ key: 'change-email', req }),
      changePasswordForm: popForm({ key: 'change-password', req }),
      modal: req.query.modal,
      seo: {
        title: 'IFTTT | Browse apps',
      },
      timezones: moment.tz.names(),
      userTimezone: timezone,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
