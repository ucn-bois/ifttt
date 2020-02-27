const passport = require('passport');
const router = require('express').Router();

const authRepository = require('../repositories/auth');

router.get('/sign-in', (req, res) => {
  res.render('pages/sign-in');
});

router.get('/sign-up', (req, res) => {
  res.render('pages/sign-up');
});

router.get('/sign-out', (req, res, next) => {
  req.logout();
  res.redirect('/sign-in');
});

router.post('/sign-up', async (req, res, next) => {
  try {
    await authRepository.signUp(req.body);
    res.redirect('/sign-in');
  } catch (err) {
    next(err);
  }
});

router.post(
  '/sign-in',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/sign-in'
  })
);

module.exports = router;
