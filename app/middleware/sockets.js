// Dependencies
const url = require('url');
const { makeId } = require('../helpers/utils');
const logger = require('winston');
const jwt = require('jsonwebtoken');
const nconf = require('nconf');
const _ = require('lodash');
const { OPEN } = require('ws');

// Secrets
const secrets = nconf.get('secrets');
const JWT_SECRET = secrets.jwtSecret;

let clients = {};

/**
 * Websockets middleware. Initializes websockets and adds websockets methods to the http request object
 * @param {Object} wss Websocker server object
 * @returns {Function}
 */
function initialize (wss) {
    wss.on('connection', function connection(ws, req) {
        const location = url.parse(req.url, true);

        // add connection to client list
        let client = {
            id: makeId(10),
            ws: ws,
            location: location,
            userId: null,
        };
        clients[client.id] = client;


        // remove from client list on connection close
        ws.on('close', (code, reason) => {
            logger.info('[WS][' + client.id + '] connection closed');
            delete clients[client.id];
        });
        ws.on('error', error => {
            logger.error('[WS][' + client.id + '] ' + error.message);
        });

        // listen for cliend data
        ws.on('message', message => {

            try {
                message = JSON.parse(message);
            } catch (e) {
                return sendError(client.id, new Error('Failed to decode message.'))
            }

            message.data = message.data || {};

            // authorize the client
            if (message.name && message.name === 'auth') {

                let token;
                try {
                    token = jwt.verify(message.data.accessToken, JWT_SECRET);
                } catch (e) {
                    return sendError(client.id, new Error('Failed to decode access token.'));
                }

                clients[client.id].userId = token.userId;
            }
        });
    });

    return (req, res, next) => {

        req.sockets = {
            send: send,
        };
        next();
    }
}

/**
 * Send data via websockets to a specific user
 * @param {String} userId
 * @param {Object} data The data object that will be send
 */
function send (userId, data) {

    if (typeof userId === 'object') {
        userId = userId.toString();
    }

    // find the client/clients with the given userId
    let targets = _.filter(clients, client => client.userId === userId);

    _.forEach(targets, (client) => {

        if (client.ws.readyState === OPEN) {
            client.ws.send(JSON.stringify(data));
        }
    });
}

/**
 * Send error via websockets to a specific user
 * @param {String} userId
 * @param {Object} error The error object that will be sent to user
 */
function sendError (clientId, error) {
    logger.error('[WS][' + clientId + '] ' + error.message);

    if (clients[clientId] && clients[clientId].ws.readyState === OPEN) {
        clients[clientId].ws.send(JSON.stringify({
            name: 'error',
            error: error.message
        }));
    }
}

module.exports = {
    initialize,
};
