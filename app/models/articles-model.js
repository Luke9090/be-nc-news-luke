const knex = require('../../connection');
const utils = require('../utils/app-utils');

const selectArticlesById = articleId => {
  return utils
    .checkId(articleId)
    .then(() => {
      return knex('articles')
        .select('articles.*')
        .leftJoin('comments', 'comments.article_id', 'articles.article_id')
        .count('comments.comment_id as comment_count')
        .where('articles.article_id', articleId)
        .groupBy('articles.article_id');
    })
    .then(articleArr => {
      if (articleArr.length === 0) return Promise.reject({ status: 404, msg: `Could not find an article with the article ID "${articleId}".` });
      else return { article: articleArr[0] };
    });
};
exports.selectArticlesById = selectArticlesById;

exports.updateArticlesById = (articleId, body) => {
  if (typeof body.inc_votes !== 'number')
    return Promise.reject({ status: 400, msg: `Passed JSON object is not valid. Expected a key of 'inc_votes' with a number value.` });
  return selectArticlesById(articleId)
    .then(({ article }) => {
      const newVotes = article.votes + body.inc_votes;
      return knex('articles')
        .update('votes', newVotes)
        .where('article_id', articleId)
        .returning('*');
    })
    .then(articleArr => {
      return { updatedArticle: articleArr[0] };
    });
};

exports.insertCommentOnArticle = (articleId, comment) => {
  return selectArticlesById(articleId)
    .then(() => {
      if (
        Object.keys(comment)
          .sort()
          .join(',') !== 'body,username'
      )
        return Promise.reject({
          status: 400,
          msg: 'Missing or superfluous keys. The JSON object you send must have keys for body, username and no others'
        });
      if (typeof comment.username !== 'string' || comment.username.length === 0)
        return Promise.reject({ status: 400, msg: 'Invalid username. Username must be a string.' });
      if (typeof comment.body !== 'string' || comment.body.length === 0)
        return Promise.reject({ status: 400, msg: 'Invalid comment body. Comment body must be a string of non-zero length.' });

      comment.article_id = articleId;
      return knex('comments')
        .insert(utils.renameKeys(comment, ['username', 'author']))
        .returning('*');
    })
    .then(([postedComment]) => {
      return { postedComment };
    });
};

exports.selectCommentsByArticle = (articleId, query) => {
  const { sort_by = 'created_at', order = 'desc' } = query;
  if (query.sort_by) delete query.sort_by;
  if (query.order) delete query.order;
  if (Object.keys(query).length > 0) return Promise.reject({ status: 400, msg: "Bad Request. Query keys must be 'order' and/or 'sort_by'" });
  if (order !== 'desc' && order !== 'asc') return Promise.reject({ status: 400, msg: "Bad Request. Order must be either 'asc' or 'desc'" });
  return selectArticlesById(articleId)
    .then(() => {
      return knex('comments')
        .select('comment_id', 'votes', 'created_at', 'author', 'body')
        .where('article_id', articleId)
        .orderBy(sort_by, order);
    })
    .then(comments => {
      return { article_id: articleId, comment_count: comments.length, comments };
    });
};
