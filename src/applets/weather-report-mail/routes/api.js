const router = require('express').Router();

const { fetchWeatherData, sendMail } = require('../utils');
const userAppletsRepo = require('../../../repositories/userApplets');
const userRepo = require('../../../repositories/users');

router.post(
  '/api/applets/weather-report-mail/execute/:identifier',
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const userApplet = await userAppletsRepo.findUserAppletByIdentifier(
        identifier
      );
      const user = await userRepo.findUserById(userApplet.userId);
      const { city } = JSON.parse(userApplet.configuration);
      const data = await fetchWeatherData(city);
      await sendMail(user.email, data);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
