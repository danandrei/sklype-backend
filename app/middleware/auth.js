const { ServerError } = require('../helpers/server_error');

function checkUserRole (role) {
  return (req, res, next) => {
    role = typeof role === 'string' ? [role] : role;

    if (!req.user) {
      return next(new ServerError('auth/unauthorized', 401));
    }


    if (role.indexOf(req.user.role) === -1) {
      return next(new ServerError('auth/permission-denied', 403));
    }

    return next();
  }
}

module.exports = {
  checkUserRole,
};
