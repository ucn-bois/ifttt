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
      'applets.description',
      'applets.parameters',
      'applets.providerId',
      'userProviders.token',
      db.raw(
        `(case when providerBasedUserApplets.userId then true else false end) as subscribed`
      )
    );
};

const subscribeUserToProviderBasedApplet = async (userId, appletId, config) =>
  await db('providerBasedUserApplets').insert({
    appletId,
    config,
    userId
  });

const unsubscribeUserFromProviderBasedApplet = async (appletId, userId) =>
  await db('providerBasedUserApplets')
    .where({
      appletId,
      userId
    })
    .delete();

module.exports = {
  getProviderBasedUserApplets,
  subscribeUserToProviderBasedApplet,
  unsubscribeUserFromProviderBasedApplet
};
