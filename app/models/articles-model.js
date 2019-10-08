const knex = require('../../connection');

const selectArticlesById = articleId => {
  if (!Number(articleId)) return Promise.reject({ status: 400, msg: `"${articleId}" is not a valid article ID. Expected a number.` });
  return knex('articles')
    .select('articles.author', 'title', 'articles.article_id', 'articles.body', 'topic', 'articles.created_at', 'articles.votes')
    .join('comments', 'comments.article_id', 'articles.article_id')
    .count('articles.article_id as comment_count')
    .where('articles.article_id', articleId)
    .groupBy('articles.article_id')
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
