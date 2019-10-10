const topicsRouter = require('./topics-router');
const articlesRouter = require('./articles-router');
const usersRouter = require('./users-router');
const commentsRouter = require('./comments-router');
const getApiJson = require('../controllers/api-controller');

const errHandlers = require('../error-handlers');

const apiRouter = require('express').Router();

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter
  .route('/')
  .get(getApiJson)
  .all(errHandlers.send405);
apiRouter.all('/*', errHandlers.send404);

module.exports = apiRouter;
