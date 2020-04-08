const axios = require('axios');
const qs = require('querystring');

const { db } = require('../../clients');

const APPLET_ID = 3;
const SCOPES = 'repo';
const CLIENT_ID = process.env.APPLET_GITHUB_WATCHER_APP_ID;
const CLIENT_SECRET = process.env.APPLET_GITHUB_WATCHER_APP_SECRET;
const REDIRECT_URI = process.env.APPLET_GITHUB_WATCHER_REDIRECT_URI;
const AUTH_URL = [
  'https://github.com/login/oauth/authorize/',
  `?client_id=${CLIENT_ID}`,
  `&redirect_uri=${REDIRECT_URI}`,
  `&scope=${SCOPES}`
].join(''); // TODO add state for an extra security layer

const exchangeCodeForAccessToken = async code => {
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    null,
    {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
      },
      headers: {
        Accept: 'application/json'
      }
    }
  );
  console.log(`GitHub access token received: ${JSON.stringify(response.data)}`);
  return response.data;
};

module.exports = {
  APPLET_ID,
  AUTH_URL,
  exchangeCodeForAccessToken
};
