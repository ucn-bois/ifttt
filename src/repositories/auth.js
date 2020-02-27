const bcrypt = require('bcrypt');
const createError = require('http-errors');
const LocalStrategy = require('passport-local').Strategy;

const { db } = require('../clients');

const comparePassword = async (plain, hashed) => {
  const match = await bcrypt.compare(plain, hashed);
  if (!match) {
    throw createError(403, 'Supplied password and hash do not match.');
  }
};

const deserializeUser = async (id, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
};

const findUserById = async id => {
  const user = await db('users')
    .where({ id })
    .first();
  if (!user) {
    createError(404, `User with id ${id} does not exist.`);
  }
  return user;
};

const findUserByUsername = async username => {
  const user = await db('users')
    .where({ username })
    .first();
  if (!user) {
    createError(404, `User with username ${username} does not exist.`);
  }
  return user;
};

const hashPassword = async password => await bcrypt.hash(password, 6);

const login = async (username, plain) => {
  try {
    const user = await findUserByUsername(username);
    await comparePassword(plain, user.password);
    return user;
  } catch (err) {
    throw createError(
      403,
      'Wrong username or password were sent in the request.'
    );
  }
};

const serializeUser = (user, done) => done(null, user.id);

const signUp = async ({ username, email, password, repeatedPassword }) => {
  if (password !== repeatedPassword) {
    throw createError(400, 'Passwords do not match.');
  }
  await db('users').insert({
    username,
    email,
    password: await hashPassword(password)
  });
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
  deserializeUser,
  findUserById,
  findUserByUsername,
  hashPassword,
  login,
  serializeUser,
  signUp,
  PassportLocalStrategy
};
