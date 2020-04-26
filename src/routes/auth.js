const router = require('express').Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');

const { ensureLoggedIn, ensureLoggedOut } = require('../utils');
const authRepo = require('../repositories/auth');
const usersRepo = require('../repositories/users');
const userVerificationsRepo = require('../repositories/userVerifications');
const passwordResetsRepo = require('../repositories/passwordResets');

/**
 * [GET] Sign in
 */
router.get('/auth/sign-in', ensureLoggedOut, (req, res) => {
  res.render('auth/sign-in');
});

/**
 * [POST] Sign in
 */
router.post(
  '/auth/sign-in',
  ensureLoggedOut,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/sign-in'
  })
);

/**
 * [GET] Sign up
 */
router.get('/auth/sign-up', ensureLoggedOut, (req, res) =>
  res.render('auth/sign-up')
);

/**
 * [POST] Sign up
 */
router.post(
  '/auth/sign-up',
  ensureLoggedOut,
  authRepo.validateCredentials,
  async (req, res, next) => {
    try {
      authRepo.credValidationResult(req);
      const { email, plainPassword, username } = req.body;
      await usersRepo.createUser({
        email,
        hashedPassword: await authRepo.hashPassword(plainPassword),
        username
      });
      const { id: userId } = await usersRepo.findUserByUsername(username);
      await userVerificationsRepo.createUserVerification({ email, userId });
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
router.get('/auth/forgotten-password', ensureLoggedOut, (req, res) => {
  res.render('auth/forgotten-password');
});

/**
 * [POST] Forgotten password
 */
router.post(
  '/auth/forgotten-password',
  ensureLoggedOut,
  async (req, res, next) => {
    try {
      const { username } = req.body;
      const { id: userId, email } = await usersRepo.findUserByUsername(
        username
      );
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
      await passwordResetsRepo.findPasswordResetByIdentifier(identifier);
      res.render('auth/reset-password', {
        identifier
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
  ensureLoggedOut,
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const { plainPassword, repeatedPlainPassword } = req.body;
      const { userId } = await passwordResetsRepo.findPasswordResetByIdentifier(
        identifier
      );
      await authRepo.comparePlainPasswords({
        plainPassword,
        repeatedPlainPassword
      });
      await usersRepo.changePassword({
        newHashedPassword: await authRepo.hashPassword(plainPassword),
        userId
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
