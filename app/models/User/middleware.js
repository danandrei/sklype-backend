const { createHash, makeId } = require('../../helpers/utils');
const validator = require('validator');

/**
 * Hashes password using bcrypt.
 * Middleware type: pre-save.
 * @param next
 */
function hashPassword (next) {

  let user = this._update ? this._update.$set : this;

  if (!user || !user.password) {
    return next();
  }

  createHash(user.password, (error, hash) => {

    if (error) {
      return next(error);
    }

    user.password = hash;
    return next();
  });
}

function hashPasswordOnUpdate (next) {
  let update = this._update.$set;

  if (!update || !update.password) {
    return next();
  }

  if (!validator.isLength(update.password, { min: 4 })) {
    return next('user/invalid-password');
  }

  createHash(update.password, (error, hash) => {

    if (error) {
      return next(error);
    }

    update.password = hash;
    return next();
  });
}

module.exports = {
  hashPassword,
  hashPasswordOnUpdate,
};
