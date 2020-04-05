const createError = require('http-errors');
const nanoId = require('nanoid');

const { db } = require('../../clients');
const authRepository = require('../../repositories/auth');
const schedulerRepository = require('../../repositories/scheduler');

const getScheduleBasedUserApplets = async userId => {
  return db('applets')
    .leftJoin('scheduleBasedUserApplets', function() {
      this.on('applets.id', 'scheduleBasedUserApplets.appletId').on(
        'scheduleBasedUserApplets.userId',
        userId
      );
    })
    .whereNull('applets.providerId')
    .select(
      'applets.id',
      'applets.name',
      'applets.script',
      'applets.description',
      'applets.parameters',
      'scheduleBasedUserApplets.token'
    );
};

const queryScheduleBasedUserAppletByIds = async (appletId, userId) => {
  const applet = await db('scheduleBasedUserApplets')
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

const queryScheduleBasedUserAppletByToken = async (
  token,
  columns = [
    'scheduleBasedUserApplets.config',
    'applets.script',
    'users.email',
    'users.password'
  ]
) => {
  const applet = await db('scheduleBasedUserApplets')
    .innerJoin('applets', 'scheduleBasedUserApplets.appletId', 'applets.id')
    .innerJoin('users', 'scheduleBasedUserApplets.userId', 'users.id')
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
const runScheduleBasedAppletByToken = async (token, hashedPassword) => {
  const {
    config,
    script,
    email,
    password
  } = await queryScheduleBasedUserAppletByToken(token);
  authRepository.comparePasswordHashes(hashedPassword, password);
  try {
    require(`../../applets/${script}`).run(JSON.parse(config), email);
  } catch ({ message }) {
    throw createError(
      500,
      `There was a problem running applet. Please try again. Error: ${message}`
    );
  }
};

const subscribeUserToScheduleBasedApplet = async (
  userId,
  appletId,
  config,
  expression = '1 day',
  password,
  script
) => {
  const applet = require(`../../applets/${script}`);
  applet.subscribe && applet.subscribe(userId, config);
  const token = nanoId(64);
  const cronJobId = await schedulerRepository.addScheduledApplet(
    expression,
    password,
    `https://ifttt.merys.eu/api/schedule-based/applets/run/${token}`
  );
  await db('scheduleBasedUserApplets').insert({
    appletId,
    config,
    userId,
    token,
    cronJobId
  });
};

const unsubscribeUserFromScheduleBasedApplet = async (
  appletId,
  userId,
  script
) => {
  const applet = require(`../../applets/${script}`);
  applet.unsubscribe && applet.unsubscribe(userId);
  const { cronJobId } = await queryScheduleBasedUserAppletByIds(
    appletId,
    userId
  );
  await db('scheduleBasedUserApplets')
    .where({
      appletId,
      userId
    })
    .delete();
  await schedulerRepository.deleteScheduledApplet(cronJobId);
};

module.exports = {
  getScheduleBasedUserApplets,
  queryScheduleBasedUserAppletByIds,
  queryScheduleBasedUserAppletByToken,
  runScheduleBasedAppletByToken,
  subscribeUserToScheduleBasedApplet,
  unsubscribeUserFromScheduleBasedApplet
};
