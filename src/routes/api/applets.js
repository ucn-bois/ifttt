const router = require('express').Router();

const scheduledBasedAppletsRepository = require('../../repositories/applets/schedule-based');

router.post('/api/applets/run/:token', async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    await scheduledBasedAppletsRepository.runScheduleBasedAppletByToken(
      token,
      password
    );
    res.status(200).send('Executed');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
