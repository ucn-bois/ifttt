const router = require('express').Router();

const { fetchWeatherData, setFirstRow } = require('../utils');
const userAppletsRepo = require('../../../repositories/userApplets');
const userRepo = require('../../../repositories/users');

router.post(
  '/api/applets/weather-report-gsheets/execute/:identifier',
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const userApplet = await userAppletsRepo.findUserAppletByIdentifier(identifier);
      //const user = await userRepo.findUserById(userApplet.userId);
      const { city, spreadsheetId } = JSON.parse(userApplet.configuration);
      await setFirstRow(spreadsheetId);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;