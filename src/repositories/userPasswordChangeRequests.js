const createError = require('http-errors');

const { db } = require('../clients');

const findUserPasswordChangeRequestByToken = async token => {
  const request = await db('userPasswordChangeRequests')
    .where({ token })
    .first();
  if (!request || !request.isValid) {
    throw createError(404, `Provided token does not exist or is invalid.`);
  }
  return request;
};

const invalidatePasswordChangeRequest = async token => {
  await db('userPasswordChangeRequests')
    .where({ token })
    .update({ isValid: false });
};

module.exports = {
  findUserPasswordChangeRequestByToken,
  invalidatePasswordChangeRequest
};
