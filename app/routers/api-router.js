const topicsRouter = require('./topics-router');
const errHandlers = require('../error-handlers');

const apiRouter = require('express').Router();

apiRouter.use('/topics', topicsRouter);

module.exports = apiRouter;
