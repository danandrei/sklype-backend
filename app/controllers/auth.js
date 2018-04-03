const passport = require('passport');
const nconf = require('nconf');
const jwt = require('jsonwebtoken');
const { ServerError } = require('../helpers/server_error');
const { checkParams } = require('../helpers/params');

const secrets = nconf.get('secrets');
const JWT_SECRET = secrets.jwtSecret;

/**
 * Generates an auth token using user email and password credentials
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {Function} next The next function
 * @returns {Promise}
 */
function signin(req, res, next) {
  return new Promise((resolve, reject) => {
    passport.authenticate('local', (error, user, info) => {

      if (error) {
        return reject(error);
      }
      if (!user) {
        return reject(new ServerError(info, 400));
      }

      // generate token
      const secret = JWT_SECRET;
      const token = jwt.sign({
        userId: user._id
      }, secret, { expiresIn: '30 days' });

      return resolve({ token })
    })(req, res, next);
  });
}

module.exports = {
  signin,
};
