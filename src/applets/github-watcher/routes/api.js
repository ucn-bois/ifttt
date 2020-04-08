const router = require('express').Router();

router.post('/api/applets/github-watcher/webhook', async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

module.exports = router;
