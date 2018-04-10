const express = require('express');
const passport = require('passport');
const logger = require('winston');
const { ServerError } = require('../helpers/server_error');
const controllers = require('../controllers');

const router = express.Router();
const {
  auth,
  users,
  chat,
} = controllers;

/**
 * Handles controller execution and responds to user (API version).
 * This way controllers are not attached to the API.
 * @param promise Controller Promise.
 * @param params (req) => [params, ...].
 */
const controllerHandler = (promise, params, noEnd) => async (req, res, next) => {
  const boundParams = params ? params(req, res, next) : [];
  try {
    const result = await promise(...boundParams);

    if (!noEnd) {
      return res.json({
        status: 200,
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
};

const apiRouter = express.Router();


/**
 * Auth.
 */
apiRouter.post('/auth',
  controllerHandler(auth.signin, (req, res, next) => [req, res])
);

/**
 * Users.
 */
apiRouter.post('/users',
  controllerHandler(users.createOne, (req, res, next) => [req.body])
);
apiRouter.get('/users/me',
  passport.authenticate('jwt', { session: false }),
  controllerHandler(users.getOne, (req, res, next) => [req.user._id])
);


/**
 * Chat.
 */
apiRouter.post('/chat/rooms',
  passport.authenticate('jwt', { session: false }),
  controllerHandler(chat.createRoom, (req, res, next) => [req.user._id, req.body])
);
apiRouter.get('/chat/rooms',
  passport.authenticate('jwt', { session: false }),
  controllerHandler(chat.getChatRooms, (req, res, next) => [req.user._id])
);
apiRouter.get('/chat/rooms/:id',
  passport.authenticate('jwt', { session: false }),
  controllerHandler(chat.getChatRoom, (req, res, next) => [req.user._id, req.params.id])
);
apiRouter.get('/chat/rooms/:id/messages',
  passport.authenticate('jwt', { session: false }),
  controllerHandler(chat.getChatMessages, (req, res, next) => [req.user._id, req.params.id, req.query])
);
apiRouter.post('/chat/rooms/:id/messages',
  passport.authenticate('jwt', { session: false }),
  controllerHandler(chat.postMessage, (req, res, next) => [req.user._id, req.params.id, req.body, req.sockets])
);

router.use('/v0.1.0', apiRouter);

/**
 * 404
 */
router.use((req, res, next) => {
  next(new ServerError('Not Found', 404));
});

/**
 * Error-handler.
 */
router.use((err, req, res, _next) => {
  // Expected errors always throw ServerError.
  // Unexpected errors will either throw unexpected stuff or crash the application.
  if (Object.prototype.isPrototypeOf.call(ServerError.prototype, err)) {
    return res.status(err.status || 500).json({ status: err.status || 500, message: err.message});
  }

  logger.error('~~~ Unexpected error exception start ~~~');
  console.error(req);
  logger.error(err);
  logger.error('~~~ Unexpected error exception end ~~~');


  return res.status(500).json({ status: 500, message: err.message });
});

module.exports = router;
