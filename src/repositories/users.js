const createError = require('http-errors');

const { db } = require('../clients');
const authRepository = require('./auth');

const changeUserPassword = async (id, password) => {
  await db('users')
    .where({
      id
    })
    .update({
      password
    });
};

const createUser = async (username, email, password) => {
  await db('users').insert({
    username,
    email,
    password
  });
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
    throw createError(404, `User with id ${id} does not exist.`);
  }
  return user;
};

const findUserByUsername = async username => {
  const user = await db('users')
    .where({ username })
    .first();
  if (!user) {
    throw createError(404, `User with username ${username} does not exist.`);
  }
  return user;
};

const serializeUser = (user, done) => done(null, user.id);

module.exports = {
  changeUserPassword,
  createUser,
  deserializeUser,
  findUserById,
  findUserByUsername,
  serializeUser
};
