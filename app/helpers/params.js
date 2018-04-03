const _ = require('lodash');
const { ServerError } = require('./server_error');

/**
 * Returns only the params specified in the list
 * @param {Array} list the list of params
 * @param {Object} data the data object
 * @returns {Object} params
 */
function getParams (list, data) {

  let result = {};
  list.forEach(path => {
    let val = data[path];

    if (typeof val !== 'undefined') {
      result[path] = val;
    }
  });

  return result;
}

/**
 * Checks if an object contains a required list of params
 * @param {Array} list the required list of params
 * @param {Object} data the data object
 */
function checkParams (list, data) {

  list.forEach(path => {
    if (typeof _.get(data, path) === 'undefined') {
      throw new ServerError('Param ' + path + ' is required.', 400);
    }
  });
}

/**
 * Checks if string is a valid object id
 * @param {String} id
 */
function isValidObjectId (id) {

  const checkForHexRegExp = new RegExp("^(?=[a-f\\d]{24}$)(\\d+[a-f]|[a-f]+\\d)");
  if (!checkForHexRegExp.test(id)) {
    throw new ServerError('Invalid id format', 400);
  }
}

module.exports = {
  getParams,
  checkParams,
  isValidObjectId,
};
