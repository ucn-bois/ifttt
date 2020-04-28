const axios = require('axios');

const APPLET_ID = 6;

const fetchWeatherData = async city => {
  const response = await axios.get(
    'https://api.weatherbit.io/v2.0/forecast/daily',
    {
      params: {
        city: city,
        days: 1,
        key: process.env.APPLET_WEATHERBIT_APP_ID,
        lang: 'en',
        units: 'M'
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
        majorDimension: 'ROWS',
        range: 'Sheet1!A1:C1',
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
  convertTimestampToTime,
  fetchWeatherData,
  inputIntoGoogleSheet
};
