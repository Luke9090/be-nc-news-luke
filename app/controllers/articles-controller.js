const { selectArticlesById, updateArticlesById, insertCommentOnArticle, selectCommentsByArticle } = require('../models/articles-model');

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
      res.status(200).send(comment);
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
