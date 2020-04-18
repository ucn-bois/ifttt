const createError = require('http-errors');

const { db } = require('../clients');

const createUserApplet = async ({
  appletId,
  configuration,
  identifier,
  userId
}) =>
  await db('userApplets').insert({
    appletId,
    configuration,
    identifier,
    userId
  });

const deleteUserAppletByIdentifier = async identifier =>
  await db('userApplets')
    .where({ identifier })
    .delete();

const findUserAppletByAppletAndUserId = async ({ appletId, userId }) => {
  const userApplet = await db('userApplets')
    .where({ appletId, userId })
    .first();
  if (!userApplet) {
    throw createError(
      404,
      `User applet with appletId ${appletId} and user id ${userId} does not exist.`
    );
  }
  return userApplet;
};

const findUserAppletByIdentifier = async identifier => {
  const userApplet = await db('userApplets')
    .where({ identifier })
    .first();
  if (!userApplet) {
    throw createError(
      404,
      `User applet with identifier ${identifier} does not exist.`
    );
  }
  return userApplet;
};

const findUserAppletByIdentifierAndUserId = async ({ identifier, userId }) => {
  const userApplet = await db('userApplets')
    .where({ identifier, userId })
    .first();
  if (!userApplet) {
    throw createError(
      404,
      `User applet with identifier ${identifier} and user id ${userId} does not exist.`
    );
  }
  return userApplet;
};

module.exports = {
  createUserApplet,
  deleteUserAppletByIdentifier,
  findUserAppletByAppletAndUserId,
  findUserAppletByIdentifier,
  findUserAppletByIdentifierAndUserId
};
