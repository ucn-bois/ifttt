module.exports = (req, res, next) => {
  res.locals = {
    ...res.locals,
    baseUrl: `${req.protocol}://${req.headers.host}`,
    csrfToken: req.csrfToken(),
    flashes: req.flash(),
    fullUrl: `${req.protocol}://${req.headers.host + req.url}`,
    user: {
      authenticated: req.user,
      verified: req.user && req.user.isVerified,
      ...req.user,
    },
  };
  next();
};
