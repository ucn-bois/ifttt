const router = require('express').Router();

const appletsRepository = require('../../repositories/applets');

router.post('/api/applets/run/:token', async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    await appletsRepository.runAppletByToken(token, password);
    res.status(200).send('Executed');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
