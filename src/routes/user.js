const router = require('express').Router();

const { ensureLoggedIn, ensureVerified } = require('../utils');
const authRepo = require('../repositories/auth');
const usersRepo = require('../repositories/users');
const userVerificationsRepo = require('../repositories/userVerifications');

/**
 * [POST] Change password
 */
router.post(
  '/user/change-password',
  [ensureLoggedIn, ensureVerified],
  async (req, res, next) => {
    try {
      const { id: userId, password: hashedPassword } = req.user;
      const {
        newPlainPassword,
        plainPassword,
        repeatedNewPlainPassword,
      } = req.body;
      await authRepo.compareHashedPasswordWithPlainPassword({
        hashedPassword,
        plainPassword,
      });
      authRepo.comparePlainPasswords({
        plainPassword: newPlainPassword,
        repeatedPlainPassword: repeatedNewPlainPassword,
      });
      const newHashedPassword = await authRepo.hashPassword(newPlainPassword);
      await usersRepo.changePassword({
        newHashedPassword,
        userId,
      });
      req.flash(`success`, `Password successfully changed.`);
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * [POST] Change email
 */
router.post(
  '/user/change-email',
  [ensureLoggedIn, ensureVerified],
  async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      const { newEmail } = req.body;
      await userVerificationsRepo.createUserVerification({
        email: newEmail,
        userId,
      });
      await usersRepo.unverifyUser(userId);
      await usersRepo.changeEmail({ newEmail, userId });
      req.flash(`success`, `Email successfully changed`);
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
);

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
        userId,
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

/**
 * [GET] Locked account
 */
router.get('/user/locked', ensureLoggedIn, (req, res) => {
  if (req.user.isVerified) {
    return res.redirect('/');
  }
  res.render('user/locked', {
    seo: {
      title: 'IFTTT | Account locked',
    },
  });
});

module.exports = router;
