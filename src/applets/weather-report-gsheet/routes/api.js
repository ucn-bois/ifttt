const router = require('express').Router();

const { fetchWeatherData, inputIntoGSheet } = require('../utils');
const userAppletsRepo = require('../../../repositories/userApplets');

router.post(
  '/api/applets/weather-report-gsheet/execute/:identifier',
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const userApplet = await userAppletsRepo.findUserAppletByIdentifier(
        identifier
      );
      const { city, spreadsheetId } = JSON.parse(userApplet.configuration);
      const data = await fetchWeatherData(city);
      await inputIntoGSheet(spreadsheetId, data);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
