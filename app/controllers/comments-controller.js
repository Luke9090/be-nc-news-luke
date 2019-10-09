const { updateCommentVotes } = require('../models/comments-model');

exports.patchCommentVotes = (req, res, next) => {
  updateCommentVotes(req.params.comment_id, req.body)
    .then(comment => {
      res.status(200).send(comment);
    })
    .catch(next);
};
