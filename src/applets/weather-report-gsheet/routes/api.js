const router = require('express').Router();

const { fetchWeatherData, inputIntoGoogleSheet } = require('../utils');
const userAppletsRepo = require('../../../repositories/userApplets');

router.post(
  '/api/applets/weather-report-gsheet/execute/:identifier',
  async (req, res, next) => {
    try {
      console.log('I MADE IT HERE!!!!');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
