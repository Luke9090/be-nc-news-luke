const errHandlers = require('../error-handlers');
const { getArticlesById, getCommentsByArticle, patchArticlesById, postCommentOnArticle, getArticles } = require('../controllers/articles-controller');

const articlesRouter = require('express').Router();

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticle)
  .post(postCommentOnArticle)
  .all(errHandlers.send405);

articlesRouter
  .route('/:article_id')
  .get(getArticlesById)
  .patch(patchArticlesById)
  .all(errHandlers.send405);

articlesRouter
  .route('/')
  .get(getArticles)
  .all(errHandlers.send405);

module.exports = articlesRouter;
