const router = require('express').Router();
const axios = require('axios');

const { ensureLoggedIn } = require('../../../utils');

router.get(
  '/applets/weather-report-mail',
  ensureLoggedIn,
  async (req, res, next) => {
    res.render('weather-report-mail/views/index');
  }
);

router.post(
  '/applets/weather-report-mail/subscribe',
  ensureLoggedIn,
  async (req, res, next) => {
    const response = await axios.get('https://api.weatherbit.io/v2.0/current', {
      params: {
        key: process.env.APPLET_WEATHERBIT_APP_ID,
        city: 'Cadca',
        units: 'M',
        lang: 'en'
      }
    });
    console.log(response.data);
    res.redirect('/applets/weather-report-mail');
  }
);

module.exports = router;
