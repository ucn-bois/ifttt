const authRequired = require('connect-ensure-login').ensureLoggedIn;
const router = require('express').Router();

const appletsRepository = require('../repositories/applets');

router.get('/', authRequired('/sign-in'), async (req, res, next) => {
  try {
    const { id } = req.user;
    res.render('pages/home', {
      applets: await appletsRepository.getApplets(id)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
