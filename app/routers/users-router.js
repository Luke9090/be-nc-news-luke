const errHandlers = require('../error-handlers');
const { getUserByUsername } = require('../controllers/users-controller');

const usersRouter = require('express').Router();

usersRouter.route('/:username').get(getUserByUsername);

module.exports = usersRouter;
