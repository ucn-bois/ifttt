const router = require('express').Router();

const githubWatcherApplet = require('../../../applets/github-watcher');

router.post('/providers/github/webhook/:token', async req => {
  const { token } = req.params;
  await githubWatcherApplet.run(req.body, token);
});

module.exports = router;
