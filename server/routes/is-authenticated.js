module.exports = {
  isAuthenticatedRedirect(req, res, next) {
    if (req.isAuthenticated())
      return next();

    res.redirect('/login');
  },
  isAuthenticatedStatus(req, res, next) {
    if (req.isAuthenticated())
      return next();

    res.send(401);
  }
};
