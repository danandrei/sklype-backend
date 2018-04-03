const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const { User } = require('../models');
const { ServerError } = require('../helpers/server_error');
const nconf = require('nconf');

// Secrets
const secrets = nconf.get('secrets');
const JWT_SECRET = secrets.jwtSecret;

/**
 * Local strategy.
 */
passport.use(new LocalStrategy({
  usernameField: 'email',
  session: false,
}, async (email, password, done) => {

  try {
    const user = await User.findOne({ email: email }).exec();

    if (!user) {
      return done(null, false, 'Invalid email or password');
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return done(null, false, 'Invalid email or password');
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

/**
 * JWT strategy code.
 */
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
}, async (payload, done) => {

  // check token integrity
  if (!payload.userId) {
    return done(new ServerError('Invalid jwt token', 401));
  }

  try {
    const user = await User.findOne({ _id: payload.userId }).exec();

    if (!user) {
      return done(new ServerError('Invalid jwt token', 401));
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
