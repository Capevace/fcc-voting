const path = require('path');
const { isAuthenticatedRedirect } = require('./is-authenticated');

module.exports = (app, passport) => {
  app.get('/auth/twitter', passport.authenticate('twitter'));

  app.get('/auth/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build/index.html'));
  });
};
