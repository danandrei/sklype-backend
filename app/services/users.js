// Dependencies
const { ServerError } = require('../helpers/server_error');
const User = require('../models/User');

function findOne (filter = {}, projections = {}) {
  return User.findOne(filter, projections).exec();
}

async function create (userData) {
  const newUser = new User(userData);

  try {
    await newUser.validate();
    return newUser.save();
  } catch (validateError) {
    throw new ServerError(validateError, 400);
  }
}

module.exports = {
  findOne,
  create,
};
