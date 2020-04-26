const axios = require('axios');
const moment = require('moment-timezone');

const { sg } = require('../../clients');

const APPLET_ID = 5;

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

const sendMail = async (email, data) => {
  const forecast = data.data[0];
  const windInKm = Math.round(forecast.wind_spd * 3.6);
  await sg.send({
    to: email,
    from: process.env.SG_FROM_EMAIL,
    templateId: 'd-6565bc50b6d541c68847669628b53feb',
    dynamic_template_data: {
      city: `${data.city_name}, ${data.country_code}`,
      forecastDesc: forecast.weather.description,
      minTemp: forecast.min_temp,
      maxTemp: forecast.max_temp,
      sunrise: convertTimestampToTime(forecast.sunrise_ts, data.timezone),
      sunset: convertTimestampToTime(forecast.sunset_ts, data.timezone),
      windDir: forecast.wind_cdir_full,
      windSpeed: windInKm
    }
  });
};

const convertTimestampToTime = (ts, tz) => {
  return moment(ts * 1000, tz).format('HH:mm');
};

module.exports = {
  APPLET_ID,
  fetchWeatherData,
  sendMail
};
