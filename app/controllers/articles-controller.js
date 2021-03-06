const {
  selectArticlesById,
  updateArticlesById,
  insertCommentOnArticle,
  selectCommentsByArticle,
  selectArticles,
  delArticleById,
  insertArticle
} = require('../models/articles-model');

exports.getArticlesById = (req, res, next) => {
  selectArticlesById(req.params.article_id)
    .then(article => {
      res.status(200).send(article);
    })
    .catch(next);
};

exports.patchArticlesById = (req, res, next) => {
  updateArticlesById(req.params.article_id, req.body)
    .then(article => {
      res.status(200).send(article);
    })
    .catch(next);
};

exports.postCommentOnArticle = (req, res, next) => {
  insertCommentOnArticle(req.params.article_id, req.body)
    .then(comment => {
      res.status(201).send(comment);
    })
    .catch(next);
};

exports.getCommentsByArticle = (req, res, next) => {
  selectCommentsByArticle(req.params.article_id, req.query)
    .then(comments => {
      res.status(200).send(comments);
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  selectArticles(req.query)
    .then(articles => {
      res.status(200).send(articles);
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  delArticleById(req.params.article_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  insertArticle(req.body)
    .then(article => {
      res.status(201).send(article);
    })
    .catch(next);
};
