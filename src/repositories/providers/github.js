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
      client_id: '6433b4b5cf4bcbb2c8f1',
      client_secret: 'a96439f723670b6143a463266b0c2bc842ce216d',
      redirect_uri: 'http://127.0.0.1:8000/providers/github/authorize'
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
