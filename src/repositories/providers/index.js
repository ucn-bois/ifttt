const { db } = require('../../clients');

const getProvidersByUserId = async userId =>
  await db('providers')
    .leftJoin('userProviders', function() {
      this.on('userProviders.userId', userId).on(
        'userProviders.providerId',
        'providers.id'
      );
    })
    .select(
      'providers.id',
      'providers.name',
      'providers.authUrl',
      'userProviders.token'
    );

module.exports = {
  getProvidersByUserId
};
