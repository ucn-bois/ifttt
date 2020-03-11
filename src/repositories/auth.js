const bcrypt = require('bcrypt');
const createError = require('http-errors');
const nanoid = require('nanoid');
const LocalStrategy = require('passport-local').Strategy;

const { db, sg } = require('../clients');
const usersRepository = require('../repositories/users');
const userPasswordChangeRequestsRepository = require('../repositories/userPasswordChangeRequests');

const comparePassword = async (plain, hashed) => {
  const match = await bcrypt.compare(plain, hashed);
  if (!match) {
    throw createError(403, 'Provided password is incorrect.');
  }
};

const comparePasswordHashes = (hash1, hash2) => {
  if (hash1 !== hash2) {
    throw createError(403, 'Provided password is incorrect.');
  }
};

const createResetPasswordRequest = async username => {
  const { id, email } = await usersRepository.findUserByUsername(username);
  const token = nanoid(64);
  await db('userPasswordChangeRequests').insert({
    userId: id,
    token
  });
  await sg.send({
    to: email,
    from: process.env.SG_FROM_EMAIL,
    templateId: 'd-e28f424c1e674799a5b155ad213d42e1',
    dynamic_template_data: { token }
  });
};

const hashPassword = async password => await bcrypt.hash(password, 6);

const login = async (username, plain) => {
  const user = await usersRepository.findUserByUsername(username);
  await comparePassword(plain, user.password);
  return user;
};

// @TODO: Should be executed as SQL transaction not as 2 separate operations.
const resetUserPassword = async (token, password, repeatedPassword) => {
  if (password !== repeatedPassword) {
    throw createError(400, 'Passwords do not match.');
  }
  const {
    userId: id
  } = await userPasswordChangeRequestsRepository.findUserPasswordChangeRequestByToken(
    token
  );
  await userPasswordChangeRequestsRepository.invalidatePasswordChangeRequest(
    token
  );
  await usersRepository.changeUserPassword(id, await hashPassword(password));
};

const signUp = async ({ username, email, password, repeatedPassword }) => {
  if (password !== repeatedPassword) {
    throw createError(400, 'Passwords do not match.');
  }
  await usersRepository.createUser(
    username,
    email,
    await hashPassword(password)
  );
};

const changePassword = async (id, password, oldPassword, newPassword, repeatedNewPassword) => {
  await comparePassword(oldPassword, password);
  if (newPassword === repeatedNewPassword) {
    await usersRepository.changeUserPassword(id, await hashPassword(newPassword));
  } else {
    throw createError(400, 'Passwords do not match.');
  }
};

const changeEmail = async (id, email, newEmail) => {
  if (newEmail !== email) {
    await usersRepository.changeUserEmail(id, newEmail);
  } else {
    throw createError(400, 'Please enter a new email');
  }
};

const PassportLocalStrategy = new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await login(username, password);
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
);

module.exports = {
  comparePassword,
  comparePasswordHashes,
  createResetPasswordRequest,
  hashPassword,
  login,
  resetUserPassword,
  signUp,
  changePassword,
  changeEmail,
  PassportLocalStrategy
};
