const router = require('express').Router();

const { queryUserEmailsByDropboxAccountId } = require('../utils');

router.get('/api/applets/dropbox-watcher/webhook', (req, res) => {
  res.headers = {
    'Content-Type': 'text/plain',
    'x-Content-Type-Options': 'nosniff'
  };
  return res.send(req.query.challenge);
});

router.post('/api/applets/dropbox-watcher/webhook', async (req, res, next) => {
  try {
    const {
      list_folder: { accounts }
    } = req.body;
    const userEmails = await queryUserEmailsByDropboxAccountId(accounts);
    console.log(userEmails);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
