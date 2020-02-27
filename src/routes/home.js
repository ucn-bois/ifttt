const authRequired = require('connect-ensure-login').ensureLoggedIn;
const router = require('express').Router();

router.get('/', authRequired('/sign-in'), (req, res) => {
  res.render('pages/home');
});

module.exports = router;
