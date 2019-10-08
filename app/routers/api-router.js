const topicsRouter = require('./topics-router');
const usersRouter = require('./users-router');
const errHandlers = require('../error-handlers');

const apiRouter = require('express').Router();

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
