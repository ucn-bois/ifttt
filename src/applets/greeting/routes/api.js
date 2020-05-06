const router = require('express').Router();

const userAppletsRepo = require('../../../repositories/userApplets');

router.post(
  '/api/applets/greeting/execute/:identifier',
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const {
        configuration,
      } = await userAppletsRepo.findUserAppletByIdentifier(identifier);
      const { greeting } = JSON.parse(configuration);
      console.log(greeting);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
