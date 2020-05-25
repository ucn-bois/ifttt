const router = require('express').Router();
const passport = require('passport');
const moment = require('moment-timezone');

const { popForm } = require('../forms');
const forgottenPasswordFormValidation = require('../forms/validators/forgotten-password-form');
const resetPasswordFormValidation = require('../forms/validators/reset-password-form');
const signInFormValidation = require('../forms/validators/sign-in-form');
const signUpFormValidation = require('../forms/validators/sign-up-form');
const { ensureLoggedIn, ensureLoggedOut } = require('../utils');
const authRepo = require('../repositories/auth');
const usersRepo = require('../repositories/users');
const userVerificationsRepo = require('../repositories/userVerifications');
const passwordResetsRepo = require('../repositories/passwordResets');

/**
 * [GET] Sign in
 */
router.get('/auth/sign-in', ensureLoggedOut, (req, res) =>
  res.render('auth/sign-in', {
    form: popForm({ key: 'sign-in', req }),
    seo: {
      title: 'IFTTT | Sign in',
    },
  })
);

/**
 * [POST] Sign in
 */
router.post('/auth/sign-in', [
  ensureLoggedOut,
  ...signInFormValidation({
    blacklist: ['password'],
    key: 'sign-in',
  }),
  passport.authenticate('local', {
    failureRedirect: '/auth/sign-in',
    successRedirect: '/',
  }),
]);

/**
 * [GET] Sign up
 */
router.get('/auth/sign-up', ensureLoggedOut, (req, res) =>
  res.render('auth/sign-up', {
    form: popForm({ key: 'sign-up', req }),
    seo: {
      title: 'IFTTT | Sign up',
    },
  })
);

/**
 * [POST] Sign up
 */
router.post(
  '/auth/sign-up',
  [
    ensureLoggedOut,
    ...signUpFormValidation({
      blacklist: ['plainPassword', 'repeatedPlainPassword'],
      key: 'sign-up',
    }),
  ],
  async (req, res, next) => {
    try {
      const { email, plainPassword, username } = req.body;
      await usersRepo.createUser({
        email,
        hashedPassword: await authRepo.hashPassword(plainPassword),
        timezone: moment.tz.guess(),
        username,
      });
      const { id: userId } = await usersRepo.findUserByUsername({ username });
      await userVerificationsRepo.createUserVerification({ email, userId });
      req.flash('success', 'All good! You can sign in now.');
      res.redirect('/auth/sign-in');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * [GET] Sign out
 */
router.get('/auth/sign-out', ensureLoggedIn, (req, res) => {
  req.logout();
  res.redirect('/auth/sign-in');
});

/**
 * [GET] Forgotten password
 */
router.get('/auth/forgotten-password', ensureLoggedOut, (req, res) =>
  res.render('auth/forgotten-password', {
    form: popForm({ key: 'forgotten-password', req }),
    seo: {
      title: 'IFTTT | Forgotten password',
    },
  })
);

/**
 * [POST] Forgotten password
 */
router.post(
  '/auth/forgotten-password',
  [
    ensureLoggedOut,
    ...forgottenPasswordFormValidation({
      key: 'forgotten-password',
    }),
  ],
  async (req, res, next) => {
    try {
      const { username } = req.body;
      const { email, id: userId } = await usersRepo.findUserByUsername({
        username,
      });
      await passwordResetsRepo.createPasswordReset({ email, userId });
      req.flash('success', 'Check your email!');
      res.redirect('/auth/sign-in');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * [GET] Reset password
 * @params: Identifier
 */
router.get(
  '/auth/reset-password/:identifier',
  ensureLoggedOut,
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      await passwordResetsRepo.findPasswordResetByIdentifier({ identifier });
      res.render('auth/reset-password', {
        form: popForm({ key: 'reset-password', req }),
        identifier,
        seo: {
          title: 'IFTTT | Reset password',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * [POST] Reset password
 * @params: identifier
 */
router.post(
  '/auth/reset-password/:identifier',
  [
    ensureLoggedOut,
    ...resetPasswordFormValidation({
      key: 'reset-password',
      persistOnFailure: false,
    }),
  ],
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const { plainPassword } = req.body;
      const { userId } = await passwordResetsRepo.findPasswordResetByIdentifier(
        {
          identifier,
        }
      );
      await usersRepo.changePassword({
        newHashedPassword: await authRepo.hashPassword(plainPassword),
        userId,
      });
      await passwordResetsRepo.invalidatePasswordReset(identifier);
      req.flash('success', 'You can now sign in!');
      res.redirect('/auth/sign-in');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
