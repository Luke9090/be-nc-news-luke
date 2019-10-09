const knex = require('../../connection');
const utils = require('../utils/app-utils');

const selectCommentById = (commentId) => {
  return knex('comments').select('*').where('comment_id', commentId)
  .then(commentArr => {
    if (commentArr.length===0) return Promise.reject({status:400, msg:`Bad request. Could not find a comment with comment_id of "${commentId}"`});
    return commentArr[0];
  });
};

exports.updateCommentVotes = (commentId, patchObj) => {
  if (isNaN(commentId)) return Promise.reject({status: 400, msg: `Bad request. "${commentId}" is not a valid comment_id. Must be a number.`});
  return utils.checkJsonKeys(patchObj, ['inc_votes'])
  .then(() => {
    if (isNaN(patchObj.inc_votes)) return Promise.reject({status:400, msg:'Bad request. The value of inc_votes must be a number.'})
    return selectCommentById(commentId);
  })
  .then(comment => {
    const newVotes = comment.votes + patchObj.inc_votes;
    return knex('comments').where('comment_id', commentId).update('votes', newVotes).returning('*');
  })
  .then(([updatedComment]) => {
    return {updatedComment};
  });
};
