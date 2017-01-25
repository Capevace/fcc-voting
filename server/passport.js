const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy  = require('passport-twitter').Strategy;
const { User } = require('./schemas');

module.exports = passport => {
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK
    },
    function(token, tokenSecret, profile, done) {
      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Twitter
      process.nextTick(function() {
        User.findOne({ 'twitter.id': profile.id }, function(err, user) {
          // return error on error
          if (err) return done(err);

          // if the user is found then log them in
          if (user) {
            return done(null, user);
          } else {
            // if there is no user, create them
            var newUser = new User();

            // set all of the user data that we need
            newUser.twitter.id = profile.id;
            newUser.twitter.token = token;
            newUser.twitter.username = profile.username;
            newUser.twitter.displayName = profile.displayName;

            // save our user into the database
            newUser.save(function(err) {
              if (err) throw err;

              return done(null, newUser);
            });
          }
        });

      });

    }));
};
