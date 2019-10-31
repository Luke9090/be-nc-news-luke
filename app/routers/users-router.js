const errHandlers = require('../error-handlers');
const { getUserByUsername, getUsers } = require('../controllers/users-controller');

const usersRouter = require('express').Router();

usersRouter
  .route('/')
  .get(getUsers)
  .all(errHandlers.send405);

usersRouter
  .route('/:username')
  .get(getUserByUsername)
  .all(errHandlers.send405);

module.exports = usersRouter;
