const errHandlers = require('../error-handlers');
const commentsRouter = require('express').Router();
const { patchCommentVotes, deleteCommentById } = require('../controllers/comments-controller');

commentsRouter
  .route('/:comment_id')
  .patch(patchCommentVotes)
  .delete(deleteCommentById)
  .all(errHandlers.send405);

module.exports = commentsRouter;
