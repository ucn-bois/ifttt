const axios = require('axios');
const qs = require('querystring');

const { db } = require('../../clients');

const APPLET_ID = 2;
const AUTH_URL = [
  'https://www.dropbox.com/oauth2/authorize',
  `?client_id=${process.env.APPLET_DROPBOX_WATCHER_APP_ID}`,
  '&response_type=code',
  `&redirect_uri=${process.env.APPLET_DROPBOX_WATCHER_REDIRECT_URI}`
].join('');

const exchangeCodeForAccessToken = async code => {
  const response = await axios.post(
    'https://api.dropboxapi.com/oauth2/token',
    qs.stringify({
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.APPLET_DROPBOX_WATCHER_REDIRECT_URI
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: process.env.APPLET_DROPBOX_WATCHER_APP_ID,
        password: process.env.APPLET_DROPBOX_WATCHER_APP_SECRET
      }
    }
  );
  return response.data;
};

const queryUserEmailsByDropboxAccountId = async accountIds => {
  const condition = accountIds
    .map(
      accountId =>
        `JSON_CONTAINS(configuration, '"${accountId}"', '$.accountId')`
    )
    .join(' OR ');
  return db('userApplets')
    .innerJoin('users', 'userApplets.userId', 'users.id')
    .whereRaw(condition)
    .select('users.email');
};

module.exports = {
  APPLET_ID,
  AUTH_URL,
  exchangeCodeForAccessToken,
  queryUserEmailsByDropboxAccountId
};
