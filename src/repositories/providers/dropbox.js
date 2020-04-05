const axios = require('axios');
const qs = require('querystring');

const { db } = require('../../clients');

const connectProvider = async ({ userId, providerId, code }) => {
  const response = await getTokenByCode(code);
  const {
    access_token: token,
    account_id: accountId,
    team_id: teamId
  } = response.data;
  await db('userProviders').insert({
    userId,
    providerId,
    token,
    parameters: JSON.stringify({
      accountId,
      teamId
    })
  });
};

const getTokenByCode = async code => {
  return await axios.post(
    'https://api.dropboxapi.com/oauth2/token',
    qs.stringify({
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.DROPBOX_REDIRECT_URI
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: process.env.DROPBOX_APP_ID,
        password: process.env.DROPBOX_APP_SECRET
      }
    }
  );
};

const queryUserEmailsByDropboxAccountId = async accountIds => {
  const condition = accountIds
    .map(
      accountId => `JSON_CONTAINS(parameters, '"${accountId}"', '$.accountId')`
    )
    .join(' OR ');
  return db('userProviders')
    .innerJoin('users', 'userProviders.userId', 'users.id')
    .whereRaw(condition)
    .select('users.email');
};

module.exports = {
  connectProvider,
  getTokenByCode,
  queryUserEmailsByDropboxAccountId
};
