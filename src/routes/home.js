const router = require('express').Router();

const { ensureLoggedIn, ensureVerified } = require('../utils');
const appletsRepo = require('../repositories/applets');
const { popForm } = require('../forms');

router.get('/', [ensureLoggedIn, ensureVerified], async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const applets = await appletsRepo.getApplets(userId);
    res.render('pages/browse-apps', {
      applets: applets,
      changePasswordForm: popForm({ key: 'change-password', req }),
      // eslint-disable-next-line sort-keys
      changeEmailForm: popForm({ key: 'change-email', req }),
      seo: {
        title: 'IFTTT | Browse apps',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
