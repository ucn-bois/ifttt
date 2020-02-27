module.exports = (req, res, next) => {
  res.locals = {
    ...res.locals,
    csrfToken: req.csrfToken(),
    flashes: req.flash(),
    baseUrl: `${req.protocol}://${req.headers.host}`,
    fullUrl: `${req.protocol}://${req.headers.host + req.url}`,
    user: req.user
  };
  next();
};
