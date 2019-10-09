const errHandlers = require('../error-handlers');
const { getArticlesById, getCommentsByArticle, patchArticlesById, postCommentOnArticle, getArticles } = require('../controllers/articles-controller');

const articlesRouter = require('express').Router();

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticle)
  .post(postCommentOnArticle);

articlesRouter
  .route('/:article_id')
  .get(getArticlesById)
  .patch(patchArticlesById);

articlesRouter.route('/').get(getArticles);

module.exports = articlesRouter;
