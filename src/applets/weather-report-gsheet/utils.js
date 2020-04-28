const axios = require('axios');

const { sg } = require('../../clients');

const APPLET_ID = 6;

const fetchWeatherData = async city => {
  const response = await axios.get(
    'https://api.weatherbit.io/v2.0/forecast/daily',
    {
      params: {
        key: process.env.APPLET_WEATHERBIT_APP_ID,
        city: city,
        units: 'M',
        lang: 'en',
        days: 1
      }
    }
  );

  return response.data;
};

// WIP
const inputIntoGoogleSheet = async (spreadsheetId, data) => {
  const forecast = data.data[0];
  const windInKm = Math.round(forecast.wind_spd * 3.6);
  await axios.post(
    'https://sheets.googleapis.com/v4/spreadsheets/d/{spreadsheetId}/values/{range}:append',
    {
      params: {
        range: 'Sheet1!A1:C1',
        majorDimension: 'ROWS',
        values: [
          `${data.city_name}`,
          `${forecast.min_temp} + " - " + ${forecast.max_temp}`,
          windInKm
        ]
      }
    }
  );
};

const convertTimestampToTime = ts => {
  const date = new Date(ts * 1000);
  const hours = date.getHours();
  const minutes = '0' + date.getMinutes();
  return hours + ':' + minutes.substr(-2);
};

module.exports = {
  APPLET_ID,
  fetchWeatherData,
  inputIntoGoogleSheet
};
