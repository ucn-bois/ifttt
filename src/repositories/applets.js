const createError = require('http-errors');
const nanoId = require('nanoid');

const { db } = require('../clients');

const getApplets = async userId =>
  await db('applets')
    .leftJoin('userApplets', function() {
      this.on('applets.id', 'userApplets.appletId').on(
        'userApplets.userId',
        userId
      );
    })
    .select(
      'applets.id',
      'applets.name',
      'applets.description',
      'applets.parameters',
      'userApplets.token'
    );

const queryAppletByToken = async (
  token,
  columns = ['userApplets.config', 'applets.script']
) => {
  const applet = await db('userApplets')
    .innerJoin('applets', 'userApplets.appletId', 'applets.id')
    .select(columns)
    .where({
      token
    })
    .first();
  if (!applet) {
    throw createError(404, 'Applet with provided token does not exist');
  }
  return applet;
};

const runAppletWithToken = async (token, email) => {
  try {
    const { config, script } = await queryAppletByToken(token);
    require(`../applets/${script}`)(JSON.parse(config), email);
  } catch (err) {
    throw createError(
      500,
      'There was a problem running applet. Please try again.'
    );
  }
};

const subscribeUserToApplet = async (userId, appletId, config) => {
  await db('userApplets').insert({
    userId,
    appletId,
    config,
    token: nanoId(32)
  });
};

const unsubscribeUserFromApplet = async (userId, appletId) => {
  await db('userApplets')
    .where({
      userId,
      appletId
    })
    .delete();
};

module.exports = {
  getApplets,
  queryAppletByToken,
  runAppletWithToken,
  subscribeUserToApplet,
  unsubscribeUserFromApplet
};
