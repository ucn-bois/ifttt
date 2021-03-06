const qs = require('querystring');
const axios = require('axios');

const APPLET_ID = 4;
const CLIENT_ID = process.env.APPLET_DISCORD_APP_ID;
const CLIENT_SECRET = process.env.APPLET_DISCORD_APP_SECRET;
const REDIRECT_URI = process.env.APPLET_DISCORD_REDIRECT_URI;
const AUTH_URL = [
  'https://discordapp.com/api/oauth2/authorize',
  '?response_type=code',
  `&client_id=${CLIENT_ID}`,
  '&scope=webhook.incoming&',
  `&redirect_uri=${REDIRECT_URI}`,
].join('');

const getAccessToken = async ({ code }) => {
  const response = await axios.post(
    'https://discordapp.com/api/v6/oauth2/token',
    qs.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: `${REDIRECT_URI}`,
      scope: 'webhook.incoming',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data;
};

const sendDiscordMessage = async ({ content, country, url }) => {
  await axios.post(url, {
    embeds: [
      {
        description: `Cases confirmed: ${content.confirmed} Deaths: ${content.deaths} People recovered: ${content.recovered} `,
        title: `${country} ${content.date}`,
        type: 'rich',
      },
    ],
    username: 'COVID-19 Report Messenger',
  });
};

const removeWebhook = async (url) => {
  await axios.delete(url);
};

module.exports = {
  APPLET_ID,
  AUTH_URL,
  getAccessToken,
  removeWebhook,
  sendDiscordMessage,
};
