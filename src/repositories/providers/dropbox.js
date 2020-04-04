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
      redirect_uri: 'http://127.0.0.1:8000/providers/dropbox/authorize'
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: 'bqac1w42q5ef0p4',
        password: 'fg13u1saldduza8'
      }
    }
  );
};

module.exports = {
  connectProvider,
  getTokenByCode
};
