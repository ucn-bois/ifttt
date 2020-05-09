const axios = require('axios');

const APPLET_ID = 6;

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
  process.env.APPLET_GSHEET_CLIENT_ID,
  process.env.APPLET_GSHEET_CLIENT_SECRET,
  process.env.APPLET_GSHEET_CLIENT_REDIRECT_URL
);

const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

const exchangeCodeForAccessToken = async (code) => {
  const { token } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(token);
};

const convertTimestampToTime = (ts) => {
  const date = new Date(ts * 1000);
  const hours = date.getHours();
  const minutes = '0' + date.getMinutes();
  return hours + ':' + minutes.substr(-2);
};

module.exports = {
  APPLET_ID,
  authUrl,
  convertTimestampToTime,
  exchangeCodeForAccessToken,
};
