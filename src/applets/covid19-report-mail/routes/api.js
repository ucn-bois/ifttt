const router = require('express').Router();

const { sg } = require('../../../clients');
const {
  fetchAndProcessCovid19Data,
} = require('../../shared/covid19-report/utils');
const usersRepo = require('../../../repositories/users');
const userAppletsRepo = require('../../../repositories/userApplets');

router.post(
  '/api/applets/covid19-report-mail/execute/:identifier',
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const {
        configuration,
        userId,
      } = await userAppletsRepo.findUserAppletByIdentifier(identifier);
      const { email } = await usersRepo.findUserById(userId);
      const { country } = JSON.parse(configuration);
      const data = await fetchAndProcessCovid19Data(country);
      await sg.send({
        dynamic_template_data: { country, ...data },
        from: process.env.SG_FROM_EMAIL,
        templateId: 'd-fc4584e586c546f794ff92eef1f4759d',
        to: email,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
