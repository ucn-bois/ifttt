const router = require('express').Router();

const { ensureLoggedIn, ensureVerified } = require('../utils');
const appletsRepo = require('../repositories/applets');
const { popForm } = require('../forms');

router.get('/', [ensureLoggedIn, ensureVerified], async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const applets = await appletsRepo.getApplets(userId);
    const formKeyName = Object.keys(req.session.forms)[0]; // I did it because I have two forms- change password and email form that redirects to homepage after failure.
    res.render('pages/browse-apps', {
      applets: applets,
      form: popForm({ key: formKeyName, req }), //I dont know how to display it, maybe in req.flash? but I haven't figured out how to do it yet.
      seo: {
        title: 'IFTTT | Browse apps',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
