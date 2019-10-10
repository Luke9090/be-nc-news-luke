const commentsRouter = require('express').Router();
const { patchCommentVotes, deleteCommentById } = require('../controllers/comments-controller');

commentsRouter
  .route('/:comment_id')
  .patch(patchCommentVotes)
  .delete(deleteCommentById);

module.exports = commentsRouter;
