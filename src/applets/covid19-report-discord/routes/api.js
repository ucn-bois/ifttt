const router = require('express').Router();

const {
  fetchAndProcessCovid19Data
} = require('../../shared/covid19-report/utils');
const { sendDiscordMessage } = require('../utils');
const userAppletsRepo = require('../../../repositories/userApplets');

router.post(
  '/api/applets/covid19-report-discord/execute/:identifier',
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const userApplet = await userAppletsRepo.findUserAppletByIdentifier(
        identifier
      );
      const { country, url } = JSON.parse(userApplet.configuration);
      const data = await fetchAndProcessCovid19Data(country);
      await sendDiscordMessage({ url, content: data });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
