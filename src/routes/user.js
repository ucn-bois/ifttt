const router = require('express').Router();
const signInRequired = require('connect-ensure-login').ensureLoggedIn;
const signOutRequired = require('connect-ensure-login').ensureLoggedOut;

const { ensureLoggedIn, ensureLoggedOut } = require('../utils');
const authRepo = require('../repositories/auth');
const usersRepo = require('../repositories/users');
const userVerificationsRepo = require('../repositories/userVerifications');

/**
 * [GET] Change password
 */
router.get('/user/change-password', ensureLoggedIn, (req, res) => {
  res.render('user/change-password');
});

/**
 * [POST] Change password
 */
router.post(
  '/user/change-password',
  ensureLoggedIn,
  [authRepo.validatePassword, authRepo.comparePasswords],
  async (req, res, next) => {
    try {
      authRepo.validationResults(req);
      const { id: userId, password: hashedPassword } = req.user;
      const { oldPlainPassword, plainPassword } = req.body;
      await authRepo.compareHashedPasswordWithPlainPassword({
        hashedPassword,
        plainPassword: oldPlainPassword
      });
      const newHashedPassword = await authRepo.hashPassword(plainPassword);
      await usersRepo.changePassword({
        newHashedPassword,
        userId
      });
      req.flash(`success`, `Password successfully changed.`);
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * [GET] Change email
 */
router.get('/user/change-email', ensureLoggedIn, (req, res) => {
  res.render('user/change-email');
});

/**
 * [POST] Change email
 */
router.post('/user/change-email', ensureLoggedIn, async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { newEmail } = req.body;
    await userVerificationsRepo.createUserVerification({
      email: newEmail,
      userId
    });
    await usersRepo.unverifyUser(userId);
    await usersRepo.changeEmail({ newEmail, userId });
    req.flash(`success`, `Email successfully changed`);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

/**
 * [GET] Verify email
 * @params: identifier
 */
router.get(
  '/user/verify/:identifier',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const {
        userId
      } = await userVerificationsRepo.findUserVerificationByIdentifier(
        identifier
      );
      await userVerificationsRepo.invalidateUserVerification(identifier);
      await usersRepo.verifyUser(userId);
      req.flash('success', 'Your account is now verified!');
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

router.get('/test', signOutRequired('/'), (req, res) => res.send('Ok'));

module.exports = router;
