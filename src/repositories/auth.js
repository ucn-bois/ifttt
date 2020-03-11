const bcrypt = require('bcrypt');
const createError = require('http-errors');
const LocalStrategy = require('passport-local').Strategy;

const { sg } = require('../clients');
const usersRepository = require('../repositories/users');
const userRequestsRepository = require('../repositories/userRequests');

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
  const token = await userRequestsRepository.createUserRequest(id, 1);
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
    userId,
    actionId
  } = await userRequestsRepository.findUserRequestByToken(token);
  if (actionId !== 1) {
    throw createError(400, 'Token provided does not serve for password reset');
  }
  await userRequestsRepository.invalidateUserRequest(token);
  await usersRepository.changeUserPassword(
    userId,
    await hashPassword(password)
  );
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
  const { id } = await usersRepository.findUserByUsername(username);
  const token = await userRequestsRepository.createUserRequest(id, 2);
  await sg.send({
    to: email,
    from: process.env.SG_FROM_EMAIL,
    templateId: 'd-20c4415293cc41db90ebe330b42fe312',
    dynamic_template_data: { token }
  });
};

const changePassword = async (
  id,
  password,
  oldPassword,
  newPassword,
  repeatedNewPassword
) => {
  await comparePassword(oldPassword, password);
  if (newPassword === repeatedNewPassword) {
    await usersRepository.changeUserPassword(
      id,
      await hashPassword(newPassword)
    );
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
