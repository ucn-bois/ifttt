const axios = require('axios');
const qs = require('querystring');

const { db } = require('../../clients');

const connectProvider = async ({ userId, providerId, code }) => {
  const response = await getTokenByCode(code);
  const { access_token: token } = response.data;
  await db('userProviders').insert({
    userId,
    providerId,
    token
  });
};

const getTokenByCode = async code => {
  return await axios.post(
    'https://github.com/login/oauth/access_token',
    qs.stringify({
      code,
      client_id: process.env.GITHUB_APP_ID,
      client_secret: process.env.GITHUB_APP_SECRET,
      redirect_uri: process.env.GITHUB_REDIRECT_URI
    }),
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
};

module.exports = {
  connectProvider,
  getTokenByCode
};
