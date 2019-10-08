const errHandlers = require('../error-handlers');
const { getArticlesById, getCommentsByArticle } = require('../controllers/articles-controller');

const articlesRouter = require('express').Router();

// articlesRouter.route('/:article_id/comments').get(getCommentsByArticle);
articlesRouter.route('/:article_id').get(getArticlesById);

module.exports = articlesRouter;
