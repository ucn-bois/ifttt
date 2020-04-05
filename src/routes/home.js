const authRequired = require('connect-ensure-login').ensureLoggedIn;
const router = require('express').Router();

router.get('/', authRequired('/sign-in'), async (req, res, next) => {
  try {
    const { id, isVerified } = req.user;
    if (!isVerified) {
      res.render('pages/user-not-verified');
    }
    res.render('pages/home');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
