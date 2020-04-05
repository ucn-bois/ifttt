const router = require('express').Router();

const dropboxWatcherApplet = require('../../../applets/dropbox-watcher');

router.get('/providers/dropbox/webhook', (req, res) => {
  res.headers = {
    'Content-Type': 'text/plain',
    'x-Content-Type-Options': 'nosniff'
  };
  return res.send(req.query.challenge);
});

router.post('/providers/dropbox/webhook', async req => {
  await dropboxWatcherApplet(req.body);
});

module.exports = router;
