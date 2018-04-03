// Dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

// Local dependecies
const config = require('nconf');

// create the express app
// configure middlewares
const passport = require('passport');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logger = require('winston');
const routes = require('../../app/routes');
let app;

module.exports = (callback) => {
  'use strict';

  app = express();

  // create the http and ws server
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  // Configure Express middleware
  app.use(morgan('common'));
  app.use(require('cookie-parser')());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended:true, limit: '10mb' }));
  app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));

  // Init passport
  app.use(passport.initialize());
  app.use(passport.session());
  require('../../app/middleware/passport_strategies');

  // CORS setup
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // * - is only temporary
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Disposition');
    next();
  });

  // init sockets
  //app.use(sockets.initialize(wss));

  // Configure routes
  app.use(routes);

  server.listen(config.get('NODE_PORT'), () => logger.info('[SERVER] Listening on port ' + config.get('NODE_PORT')));

  if (callback) {
    return callback();
  }
};
