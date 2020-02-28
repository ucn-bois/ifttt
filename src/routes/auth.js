const passport = require('passport');
const router = require('express').Router();

const authRepository = require('../repositories/auth');
const userPasswordChangeRequestsRepository = require('../repositories/userPasswordChangeRequests');

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

router.get('/forgotten-password', (req, res) => {
  res.render('pages/forgotten-password');
});

router.get('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    await userPasswordChangeRequestsRepository.findUserPasswordChangeRequestByToken(
      token
    );
    res.render('pages/reset-password', {
      token
    });
  } catch (err) {
    next(err);
  }
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

router.post('/forgotten-password', async (req, res, next) => {
  try {
    await authRepository.createResetPasswordRequest(req.body.username);
    req.flash('success', 'Check your email!');
    res.redirect('/sign-in');
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, repeatedPassword } = req.body;
    await authRepository.resetUserPassword(token, password, repeatedPassword);
    req.flash('success', 'You can now sign in!');
    res.redirect('/sign-in');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
