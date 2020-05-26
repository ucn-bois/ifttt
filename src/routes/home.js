const router = require('express').Router();
const moment = require('moment-timezone');

const { ensureLoggedIn, ensureVerified } = require('../utils');
const appletsRepo = require('../repositories/applets');

router.get('/', [ensureLoggedIn, ensureVerified], async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const applets = await appletsRepo.getApplets(userId);
    res.render('pages/browse-apps', {
      applets: applets,
      modal: req.query.modal,
      seo: {
        title: 'IFTTT | Browse apps',
      },
      timezones: moment.tz.names(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
