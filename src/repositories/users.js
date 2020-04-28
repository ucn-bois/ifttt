const createError = require('http-errors');

const { db } = require('../clients');

const changeEmail = async ({ newEmail, userId }) =>
  await db('users')
    .where({
      id: userId,
    })
    .update({
      email: newEmail,
      isVerified: false,
    });

const changePassword = async ({ newHashedPassword, userId }) => {
  await db('users')
    .where({
      id: userId,
    })
    .update({
      password: newHashedPassword,
    });
};

const createUser = async ({ email, hashedPassword, username }) =>
  await db('users').insert({
    email,
    password: hashedPassword,
    username,
  });

const findUserById = async (userId) => {
  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    throw createError(404, `User with id ${userId} does not exist.`);
  }
  return user;
};

const findUserByUsername = async (username) => {
  const user = await db('users').where({ username }).first();
  if (!user) {
    throw createError(404, `User with username ${username} does not exist.`);
  }
  return user;
};

const verifyUser = async (userId) =>
  await db('users').where({ id: userId }).update({ isVerified: true });

const unverifyUser = async (userId) =>
  await db('users').where({ id: userId }).update({ isVerified: false });

module.exports = {
  changeEmail,
  changePassword,
  createUser,
  findUserById,
  findUserByUsername,
  unverifyUser,
  verifyUser,
};
