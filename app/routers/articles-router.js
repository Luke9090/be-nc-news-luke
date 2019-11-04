const errHandlers = require('../error-handlers');
const {
  getArticlesById,
  getCommentsByArticle,
  patchArticlesById,
  postCommentOnArticle,
  getArticles,
  deleteArticleById,
  postArticle
} = require('../controllers/articles-controller');

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
  .delete(deleteArticleById)
  .all(errHandlers.send405);

articlesRouter
  .route('/')
  .get(getArticles)
  .post(postArticle)
  .all(errHandlers.send405);

module.exports = articlesRouter;
