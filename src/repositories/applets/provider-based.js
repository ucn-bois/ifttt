const { db } = require('../../clients');

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

const subscribeUserToProviderBasedApplet = async (
  userId,
  appletId,
  config,
  script
) => {
  const applet = require(`../../applets/${script}`);
  applet.subscribe && applet.subscribe(userId, config);
  await db('providerBasedUserApplets').insert({
    appletId,
    config,
    userId
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
  getProviderBasedUserApplets,
  subscribeUserToProviderBasedApplet,
  unsubscribeUserFromProviderBasedApplet
};
