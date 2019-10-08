const errHandlers = require('../error-handlers');
const { getArticlesById, getCommentsByArticle, patchArticlesById } = require('../controllers/articles-controller');

const articlesRouter = require('express').Router();

// articlesRouter.route('/:article_id/comments').get(getCommentsByArticle);
articlesRouter
  .route('/:article_id')
  .get(getArticlesById)
  .patch(patchArticlesById);

module.exports = articlesRouter;
