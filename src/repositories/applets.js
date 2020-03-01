const createError = require('http-errors');
const nanoId = require('nanoid');

const { db } = require('../clients');
const authRepository = require('../repositories/auth');
const schedulerRepository = require('../repositories/scheduler');

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

const queryUserAppletByIds = async (appletId, userId) => {
  const applet = await db('userApplets')
    .where({
      appletId,
      userId
    })
    .first();
  if (!applet) {
    throw createError(
      404,
      'Applet with provided combination of ids does not exist'
    );
  }
  return applet;
};
const queryUserAppletByToken = async (
  token,
  columns = [
    'userApplets.config',
    'applets.script',
    'users.email',
    'users.password'
  ]
) => {
  const applet = await db('userApplets')
    .innerJoin('applets', 'userApplets.appletId', 'applets.id')
    .innerJoin('users', 'userApplets.userId', 'users.id')
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

// @TODO: Let SQL query exceptions to bubble up.
const runAppletByToken = async (token, hashedPassword) => {
  const { config, script, email, password } = await queryUserAppletByToken(
    token
  );
  authRepository.comparePasswordHashes(hashedPassword, password);
  try {
    require(`../applets/${script}`)(JSON.parse(config), email);
  } catch ({ message }) {
    throw createError(
      500,
      `There was a problem running applet. Please try again. Error: ${message}`
    );
  }
};

const subscribeUserToApplet = async (
  userId,
  appletId,
  config,
  expression = '1 day',
  password
) => {
  const token = nanoId(64);
  const cronJobId = await schedulerRepository.addScheduledApplet(
    expression,
    password,
    `http://207.154.248.85/api/applets/run/${token}`
  );
  await db('userApplets').insert({
    appletId,
    config,
    userId,
    token,
    cronJobId
  });
};

const unsubscribeUserFromApplet = async (appletId, userId) => {
  const { cronJobId } = await queryUserAppletByIds(appletId, userId);
  await db('userApplets')
    .where({
      appletId,
      userId
    })
    .delete();
  await schedulerRepository.deleteScheduledApplet(cronJobId);
};

module.exports = {
  getApplets,
  queryUserAppletByIds,
  queryUserAppletByToken,
  runAppletByToken,
  subscribeUserToApplet,
  unsubscribeUserFromApplet
};
