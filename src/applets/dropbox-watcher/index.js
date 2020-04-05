const { db, sg } = require('../../clients');

const queryUserEmailsByDropboxAccountId = async accountIds => {
  const condition = accountIds
    .map(
      accountId => `JSON_CONTAINS(parameters, '"${accountId}"', '$.accountId')`
    )
    .join(' OR ');
  return db('providerBasedUserApplets')
    .innerJoin('users', 'providerBasedUserApplets.userId', 'users.id')
    .innerJoin('userProviders', 'providerBasedUserApplets.userId', 'users.id')
    .whereRaw(condition)
    .select('users.email');
};

const run = async payload => {
  const {
    list_folder: { accounts }
  } = payload;
  const results = await queryUserEmailsByDropboxAccountId(accounts);
  await sg.send({
    to: results.map(result => result.email),
    from: process.env.SG_FROM_EMAIL,
    templateId: 'd-2946746abb30473fa20456da920c99e4'
  });
};

module.exports = {
  run,
  subscribe: (userId, config) =>
    console.log(
      `Dropbox watcher subscribed! User: ${userId} Config: ${config}`
    ),
  unsubscribe: userId =>
    console.log(`Dropbox watcher unsubscribed! User ${userId}`)
};
