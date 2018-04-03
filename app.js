const nconf = require('nconf');
const logger = require('winston');
const async = require('async');

// Load Environment variables from .env file
require('dotenv').load();

// Set up configs
nconf.use('memory');
// First load command line arguments
nconf.argv();
// Load environment variables
nconf.env();
// Load config file for the environment
require('./config/environments/' + nconf.get('NODE_ENV'));

logger.info('[APP] Starting server initialization');

// Initialize Modules
async.series([
  callback => {
    require('./config/initializers/database')(callback);
  },
  callback => {
    require('./config/initializers/server')(callback);
  }], error => {
    if (error) {
      logger.error('[APP] initialization failed', error);
    } else {
      logger.info('[APP] initialized SUCCESSFULLY');
    }
  }
);
