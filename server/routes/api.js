const path = require('path');
const { isAuthenticatedStatus } = require('./is-authenticated');

const pollRoutes = require('./polls');

module.exports = (app, passport) => {
  pollRoutes(app);

  app.get('/auth/user', (req, res) => {
    if (!req.user) {
      res.json({});
      return;
    }

    res.json({
      user: {
        _id: req.user._id,
        twitterId: req.user.twitter.id,
        displayName: req.user.twitter.displayName,
        username: req.user.twitter.username
      }
    });
  });

  // handle the callback after twitter has authenticated the user
  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect : '/',
    failureRedirect : '/'
  }));
};
