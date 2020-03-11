const passport = require('passport');
const router = require('express').Router();
const signOutRequired = require('connect-ensure-login').ensureLoggedOut;
const signInRequired = require('connect-ensure-login').ensureLoggedIn;

const authRepository = require('../repositories/auth');
const userRepository = require('../repositories/users');
const userPasswordChangeRequestsRepository = require('../repositories/userPasswordChangeRequests');

router.get('/sign-in', signOutRequired('/'), (req, res) => {
  res.render('pages/sign-in');
});

router.get('/sign-up', signOutRequired('/'), (req, res) => {
  res.render('pages/sign-up');
});

router.get('/sign-out', signInRequired('/sign-in'), (req, res, next) => {
  req.logout();
  res.redirect('/sign-in');
});

router.get('/forgotten-password', signOutRequired('/'), (req, res) => {
  res.render('pages/forgotten-password');
});

router.get(
  '/reset-password/:token',
  signOutRequired('/'),
  async (req, res, next) => {
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
  }
);

router.get(
  '/change-password',
  signInRequired('/sign-in'),
  (req, res) => {
    res.render('pages/change-password');
  }
);

router.get(
  '/change-email',
  signInRequired('/sign-in'),
  (req, res) => {
    res.render('pages/change-email');
  }
);

router.post('/sign-up', signOutRequired('/'), async (req, res, next) => {
  try {
    await authRepository.signUp(req.body);
    res.redirect('/sign-in');
  } catch (err) {
    next(err);
  }
});

router.post(
  '/sign-in',
  signOutRequired('/'),
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/sign-in'
  })
);

router.post(
  '/forgotten-password',
  signOutRequired('/'),
  async (req, res, next) => {
    try {
      await authRepository.createResetPasswordRequest(req.body.username);
      req.flash('success', 'Check your email!');
      res.redirect('/sign-in');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/reset-password/:token',
  signOutRequired('/'),
  async (req, res, next) => {
    try {
      const { token } = req.params;
      const { password, repeatedPassword } = req.body;
      await authRepository.resetUserPassword(token, password, repeatedPassword);
      req.flash('success', 'You can now sign in!');
      res.redirect('/sign-in');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/change-password',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { id: userId, password } = req.user;
      const { oldPassword, newPassword, repeatedNewPassword } = req.body;
      await authRepository.changePassword(userId, password, oldPassword, newPassword, repeatedNewPassword);
      req.flash(`success`,`Password successfully changed.`);
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/change-email',
  signInRequired('/sign-in'),
  async (req, res, next) => {
    try {
      const { id: userId, email } = req.user;
      const { newEmail } = req.body;
      await authRepository.changeEmail(userId, email, newEmail);
      req.flash(`success`,`Email successfully changed`);
      res.redirect('/');
    } catch(err) {
      next(err);
    }
  }
);

module.exports = router;
