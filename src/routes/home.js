const router = require('express').Router();

const { ensureLoggedIn } = require('../utils');
const appletsRepo = require('../repositories/applets');

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const { id: userId, isVerified } = req.user;
    if (!isVerified) {
      res.render('pages/user-not-verified');
    }
    const applets = await appletsRepo.getApplets(userId);
    console.log(applets);
    res.render('pages/home', {
      applets: applets
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
