const router = require('express').Router();

router.get('/providers/dropbox/webhook', (req, res) => {
  res.headers = {
    'Content-Type': 'text/plain',
    'x-Content-Type-Options': 'nosniff'
  };
  return res.send(req.query.challenge);
});

router.post('/providers/dropbox/webhook', req => {
  console.log(req.body);
});

module.exports = router;
