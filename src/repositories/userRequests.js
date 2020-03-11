const createError = require('http-errors');
const nanoid = require('nanoid');

const { db } = require('../clients');

const createUserRequest = async (userId, actionId) => {
  const token = nanoid(32);
  await db('userRequests').insert({
    userId,
    actionId,
    token
  });
  return token;
};

const findUserRequestByToken = async token => {
  const request = await db('userRequests')
    .where({ token })
    .first();
  if (!request || request.isUsed) {
    throw createError(404, `Provided token does not exist or is invalid.`);
  }
  return request;
};

const invalidateUserRequest = async token => {
  await db('userRequests')
    .where({ token })
    .update({ isUsed: true });
};

module.exports = {
  createUserRequest,
  findUserRequestByToken,
  invalidateUserRequest
};
