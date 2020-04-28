const router = require('express').Router();

const { sendMail } = require('../utils');

router.post(
  '/api/applets/github-watcher/webhook/:identifier',
  async (req, res, next) => {
    try {
      const { identifier } = req.params;
      res.status(200).send('Webhook received.');
      await sendMail({ body: req.body, identifier });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
