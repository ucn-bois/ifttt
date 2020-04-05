const createError = require('http-errors');
const nanoId = require('nanoid');

const { db } = require('../../clients');

const changeProviderBasedUserAppletConfigByToken = async (token, config) =>
  await db('providerBasedUserApplets')
    .where({ token })
    .update({ config });

const getProviderBasedUserApplets = async userId => {
  return db('applets')
    .leftJoin('providerBasedUserApplets', function() {
      this.on('applets.id', 'providerBasedUserApplets.appletId').on(
        'providerBasedUserApplets.userId',
        userId
      );
    })
    .leftJoin('userProviders', function() {
      this.on('userProviders.providerId', 'applets.providerId').on(
        'userProviders.userId',
        userId
      );
    })
    .whereNotNull('applets.providerId')
    .select(
      'applets.id',
      'applets.name',
      'applets.script',
      'applets.description',
      'applets.parameters',
      'applets.providerId',
      'userProviders.token',
      db.raw(
        `(case when providerBasedUserApplets.userId then true else false end) as subscribed`
      )
    );
};

const queryProviderBasedUserAppletByToken = async (
  token,
  columns = [
    'providerBasedUserApplets.config',
    'applets.script',
    'users.email',
    'users.password'
  ]
) => {
  const applet = await db('providerBasedUserApplets')
    .innerJoin('applets', 'providerBasedUserApplets.appletId', 'applets.id')
    .innerJoin('users', 'providerBasedUserApplets.userId', 'users.id')
    .select(columns)
    .where({ token })
    .first();
  if (!applet) {
    throw createError(404, 'Applet with provided token does not exist');
  }
  return applet;
};

const subscribeUserToProviderBasedApplet = async (
  userId,
  appletId,
  config,
  script
) => {
  const token = nanoId(64);
  const applet = require(`../../applets/${script}`);
  applet.subscribe && applet.subscribe(userId, JSON.parse(config), token);
  await db('providerBasedUserApplets').insert({
    appletId,
    config,
    userId,
    token
  });
};

const unsubscribeUserFromProviderBasedApplet = async (
  appletId,
  userId,
  script
) => {
  const applet = require(`../../applets/${script}`);
  applet.unsubscribe && applet.unsubscribe(userId);
  await db('providerBasedUserApplets')
    .where({
      appletId,
      userId
    })
    .delete();
};

module.exports = {
  changeProviderBasedUserAppletConfigByToken,
  getProviderBasedUserApplets,
  subscribeUserToProviderBasedApplet,
  unsubscribeUserFromProviderBasedApplet
};
