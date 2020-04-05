const authRequired = require('connect-ensure-login').ensureLoggedIn;
const router = require('express').Router();

const scheduleBasedAppletsRepository = require('../repositories/applets/schedule-based');
const providerBasedAppletsRepository = require('../repositories/applets/provider-based');

router.get('/', authRequired('/sign-in'), async (req, res, next) => {
  try {
    const { id, isVerified } = req.user;
    if (!isVerified) {
      res.render('pages/user-not-verified');
    }
    res.render('pages/home', {
      providerBasedApplets: await providerBasedAppletsRepository.getProviderBasedUserApplets(
        id
      ),
      scheduleBasedApplets: await scheduleBasedAppletsRepository.getScheduleBasedUserApplets(
        id
      )
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
