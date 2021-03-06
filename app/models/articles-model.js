const knex = require('../../connection');
const utils = require('../utils/app-utils');
const { validateTopic } = require('./topics-model');

const selectArticlesById = articleId => {
  return utils
    .checkId(articleId, 'article')
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
  return utils
    .checkProperties(body, {'inc_votes': utils.isNum}, 'JSON')
    .then(() => {
      return utils.checkId(articleId, 'article');
    })
    .then(() => {
      return knex('articles')
        .increment('votes', body.inc_votes)
        .where('article_id', articleId)
        .returning('*');
    })
    .then(articleArr => {
      if (articleArr.length) return { article: articleArr[0] };
      return Promise.reject({ status: 404, msg: `Could not find an article with the article ID "${articleId}".` });
    });
};

exports.insertCommentOnArticle = (articleId, comment) => {
  return selectArticlesById(articleId)
    .then(() => {
      return utils.checkProperties(comment, {body: utils.isString, username: utils.isString}, 'JSON')
    }).then(() => {
      comment.article_id = articleId;
      return knex('comments')
        .insert(utils.renameKeys(comment, ['username', 'author']))
        .returning('*');
    })
    .then(([comment]) => {
      return { comment };
    });
};

exports.selectCommentsByArticle = (articleId, query) => {
  const newQuery = utils.renameKeys(query, ['s', 'sort_by'], ['o', 'order'], ['a', 'author'], ['l', 'limit'], ['p', 'page']);
  let { sort_by = 'created_at', order = 'desc', author, topic, limit, page } = newQuery;
  if (!limit && page) return Promise.reject({ status: 400, msg: `Bad request. Can't give paginated response if no limit is defined in query` });
  return utils
    .checkProperties(newQuery, { sort_by: [], order: ['asc', 'desc'], author: [], limit: utils.isPositiveNum, page: utils.isPositiveNum })
    .then(() => {
      return selectArticlesById(articleId);
    })
    .then(() => {
      return knex('comments')
        .select('comment_id', 'votes', 'created_at', 'author', 'body')
        .where('article_id', articleId)
        .orderBy(sort_by, order)
        .modify(knexQuery => {
          if (author) knexQuery.where('comments.author', '=', author);
        });
    })
    .then(comments => {
      const returnObj = { article_id: articleId, comment_count: comments.length, comments };
      if (limit) return utils.paginate(returnObj, 'comment', limit, page);
      return returnObj;
    });
};

exports.selectArticles = query => {
  const newQuery = utils.renameKeys(query, ['s', 'sort_by'], ['t', 'topic'], ['o', 'order'], ['a', 'author'], ['l', 'limit'], ['p', 'page']);
  let { sort_by = 'created_at', order = 'desc', author, topic, limit, page } = newQuery;
  sort_by = sort_by === 'comment_count' ? sort_by : 'articles.' + sort_by;
  if (!limit && page) return Promise.reject({ status: 400, msg: `Bad request. Can't give paginated response if no limit is defined in query` });
  return utils
    .checkProperties(newQuery, { sort_by: [], order: ['asc', 'desc'], author: [], topic: [], limit: utils.isPositiveNum, page: utils.isPositiveNum })
    .then(() => {
      return checkFilterExistence(author, topic);
    })
    .then(() => {
      return knex('articles')
        .select('articles.author', 'articles.title', 'articles.article_id', 'articles.topic', 'articles.created_at', 'articles.votes')
        .count('comments.comment_id AS comment_count')
        .leftJoin('comments', 'articles.article_id', 'comments.article_id')
        .groupBy('articles.article_id')
        .orderBy(sort_by, order)
        .modify(knexQuery => {
          if (author) knexQuery.where('articles.author', '=', author);
          if (topic) knexQuery.where('articles.topic', '=', topic);
        });
    })
    .then(articles => {
      articles.forEach(article => {
        article.comment_count = Number(article.comment_count);
      });
      return { article_count: articles.length, articles };
    })
    .then(unlimitedRes => {
      if (!limit) return unlimitedRes;
      if (page > 1 && page > Math.ceil(unlimitedRes.article_count / limit))
        return Promise.reject({
          status: 404,
          msg: `Not found. Requested page ${page} but there are only ${Math.ceil(unlimitedRes.article_count / limit)} pages available.`
        });
      return (limited = knex('articles')
        .select('articles.author', 'articles.title', 'articles.article_id', 'articles.topic', 'articles.created_at', 'articles.votes')
        .count('comments.comment_id AS comment_count')
        .leftJoin('comments', 'articles.article_id', 'comments.article_id')
        .groupBy('articles.article_id')
        .orderBy(sort_by, order)
        .modify(knexQuery => {
          if (author) knexQuery.where('articles.author', '=', author);
          if (topic) knexQuery.where('articles.topic', '=', topic);
          if (limit) knexQuery.limit(limit);
          if (page) knexQuery.offset((page - 1) * limit);
        })
        .then(limited => {
          limited.forEach(article => {
            article.comment_count = Number(article.comment_count);
          });
          unlimitedRes.articles = limited;
          unlimitedRes.page = Number(page) || 1;
          unlimitedRes.available_pages = Math.ceil(unlimitedRes.article_count / limit);
          return unlimitedRes;
        }));
    });
};

const checkFilterExistence = (author, topic) => {
  const authorCheck = author
    ? knex('users')
        .select('*')
        .where('username', author)
    : Promise.resolve([1]);
  const topicCheck = topic
    ? knex('topics')
        .select('*')
        .where('slug', topic)
    : Promise.resolve([1]);
  return Promise.all([authorCheck, topicCheck]).then(checks => {
    const bothExist = checks.every(check => check.length > 0);
    if (bothExist) return Promise.resolve();
    return Promise.reject({ status: 404, msg: 'Author or Topic from query not found.' });
  });
};

exports.delArticleById = articleId => {
  return utils
    .checkId(articleId, 'article')
    .then(() => {
      return knex('articles')
        .where('article_id', articleId)
        .delete();
    })
    .then(deletions => {
      if (!deletions) return Promise.reject({ status: 404, msg: `Could not find an article with the article ID "${articleId}".` });
    });
};

exports.insertArticle = article => {
  return utils.checkProperties(article, {body: utils.isString, username: utils.isString, topic: utils.isString, title: utils.isString}, 'JSON').then(async () => {
    const topicValidity = await validateTopic(article.topic);
    if (!topicValidity.exists) return Promise.reject({ status: 404, msg: `Topic "${article.topic}" does not exist.` });
    return knex('articles')
      .insert(utils.renameKeys(article, ['username', 'author']))
      .returning('*')
      .then(([article]) => {
        return { article };
      });
  });
};
