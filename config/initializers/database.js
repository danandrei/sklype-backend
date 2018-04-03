// dependencies
const mongoose = require('mongoose');
const nconf = require('nconf');

module.exports = (callback) => {
  const dbConfig = nconf.get('database');

  if (!dbConfig) {
    return callback(new Error('Missing database config.'));
  }

  // connect to mongoose
  mongoose.connect('mongodb://' + dbConfig.server + '/' + dbConfig.dbName);
  let db = mongoose.connection;
  db.on('error', error => callback(error));
  db.once('open', () => callback());
};
