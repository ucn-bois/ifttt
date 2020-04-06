const router = require('express').Router();

const { sg } = require('../../../clients');
const { fetchAndProcessCovid19Data } = require('../utils');
const usersRepo = require('../../../repositories/users');
const userAppletsRepo = require('../../../repositories/userApplets');

router.post(
  '/api/applets/covid19-report/execute/:identifier',
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const {
        configuration,
        userId
      } = await userAppletsRepo.findUserAppletByIdentifier(identifier);
      const { email } = await usersRepo.findUserById(userId);
      const { country } = JSON.parse(configuration);
      const data = await fetchAndProcessCovid19Data(country);
      await sg.send({
        to: email,
        from: process.env.SG_FROM_EMAIL,
        templateId: 'd-fc4584e586c546f794ff92eef1f4759d',
        dynamic_template_data: { ...data }
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
