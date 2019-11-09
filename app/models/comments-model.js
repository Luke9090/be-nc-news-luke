const knex = require('../../connection');
const utils = require('../utils/app-utils');

const selectCommentById = commentId => {
  if (isNaN(commentId)) return Promise.reject({ status: 400, msg: `Bad request. "${commentId}" is not a valid comment_id. Must be a number.` });
  return knex('comments')
    .select('*')
    .where('comment_id', commentId)
    .then(commentArr => {
      if (commentArr.length === 0) return Promise.reject({ status: 404, msg: `Not found. Could not find a comment with comment_id of "${commentId}"` });
      return commentArr[0];
    });
};

exports.updateCommentVotes = (commentId, patchObj) => {
  return utils
    .checkProperties(patchObj, {inc_votes: utils.isNum}, 'JSON')
    .then(() => {
      return selectCommentById(commentId);
    })
    .then(comment => {
      const newVotes = comment.votes + patchObj.inc_votes;
      return knex('comments')
        .where('comment_id', commentId)
        .update('votes', newVotes)
        .returning('*');
    })
    .then(([comment]) => {
      return { comment };
    });
};

exports.delCommentById = commentId => {
  return selectCommentById(commentId).then(() => {
    return knex('comments')
      .where('comment_id', commentId)
      .del();
  });
};
