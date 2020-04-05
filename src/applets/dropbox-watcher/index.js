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

module.exports = async payload => {
  const {
    list_folder: { accounts }
  } = payload;
  const results = queryUserEmailsByDropboxAccountId(accounts);
  await sg.send({
    to: results.map(result => result.email),
    from: process.env.SG_FROM_EMAIL,
    templateId: 'd-2946746abb30473fa20456da920c99e4'
  });
};
