const { updateCommentVotes, delCommentById } = require('../models/comments-model');

exports.patchCommentVotes = (req, res, next) => {
  updateCommentVotes(req.params.comment_id, req.body)
    .then(comment => {
      res.status(200).send(comment);
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  delCommentById(req.params.comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};
