const router = require('express').Router();

const { ensureLoggedIn, ensureVerified } = require('../utils');
const appletsRepo = require('../repositories/applets');

router.get('/', [ensureLoggedIn, ensureVerified], async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const applets = await appletsRepo.getApplets(userId);
    res.render('pages/browse-apps', {
      applets: applets,
      seo: {
        title: 'IFTTT | Browse apps',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
