const axios = require('axios');

const APPLET_ID = 6;

const fs = require('fs');
const readline = require('readline');

// npm install googleapis@39
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
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      //TODO: store the refresh_token in my database!
      console.log(tokens.refresh_token);
    }
    console.log(tokens.access_token);
  });
  oAuth2Client.setCredentials({
    refresh_token: tokens.refresh_token,
  });
};

const inputIntoGSheet = async (spreadsheetId, data) => {
  const forecast = data.data[0];
  const windInKm = Math.round(forecast.wind_spd * 3.6);

  let values = [windInKm, forecast.max_temp, forecast.min_temp];

  let resource = {
    values,
  };

  const sheets = google.sheets({
    auth: oAuth2Client,
    version: 'v4',
  });

  await sheets.spreadsheets.values.append(
    {
      range: 'Sheet1!A1:C1',
      resource: resource,
      spreadsheetId: spreadsheetId,
      valueInputOption: 'USER_ENTERED',
    },
    (err, result) => {
      if (err) {
        // Handle error.
        console.log(err);
      } else {
        console.log(`${result.updates.updatedCells} cells appended.`);
      }
    }
  );
};

const convertTimestampToTime = (ts) => {
  const date = new Date(ts * 1000);
  const hours = date.getHours();
  const minutes = '0' + date.getMinutes();
  return hours + ':' + minutes.substr(-2);
};

const fetchWeatherData = async (city) => {
  const response = await axios.get(
    'https://api.weatherbit.io/v2.0/forecast/daily',
    {
      params: {
        city: city,
        days: 1,
        key: process.env.APPLET_WEATHERBIT_APP_ID,
        lang: 'en',
        units: 'M',
      },
    }
  );

  return response.data;
};

module.exports = {
  APPLET_ID,
  authUrl,
  convertTimestampToTime,
  exchangeCodeForAccessToken,
  fetchWeatherData,
  inputIntoGSheet,
};
