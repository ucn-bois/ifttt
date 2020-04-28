module.exports = (req, res, next) => {
  res.locals = {
    ...res.locals,
    baseUrl: `${req.protocol}://${req.headers.host}`,
    csrfToken: req.csrfToken(),
    flashes: req.flash(),
    fullUrl: `${req.protocol}://${req.headers.host + req.url}`,
    user: req.user,
  };
  next();
};
