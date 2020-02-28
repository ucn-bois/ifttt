const bcrypt = require('bcrypt');
const createError = require('http-errors');
const nanoid = require('nanoid');
const LocalStrategy = require('passport-local').Strategy;

const { db } = require('../clients');
const usersRepository = require('../repositories/users');
const userPasswordChangeRequestsRepository = require('../repositories/userPasswordChangeRequests');

const comparePassword = async (plain, hashed) => {
  const match = await bcrypt.compare(plain, hashed);
  if (!match) {
    throw createError(403, 'Provided password is incorrect.');
  }
};

const createResetPasswordRequest = async username => {
  const { id } = await usersRepository.findUserByUsername(username);
  await db('userPasswordChangeRequests').insert({
    userId: id,
    token: nanoid(64)
  });
};

const hashPassword = async password => await bcrypt.hash(password, 6);

const login = async (username, plain) => {
  const user = await usersRepository.findUserByUsername(username);
  await comparePassword(plain, user.password);
  return user;
};

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
  createResetPasswordRequest,
  hashPassword,
  login,
  resetUserPassword,
  signUp,
  PassportLocalStrategy
};
