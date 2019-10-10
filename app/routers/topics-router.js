const errHandlers = require('../error-handlers');
const { getTopics } = require('../controllers/topics-controller');

const topicsRouter = require('express').Router();

topicsRouter
  .route('/')
  .get(getTopics)
  .all(errHandlers.send405);

module.exports = topicsRouter;
