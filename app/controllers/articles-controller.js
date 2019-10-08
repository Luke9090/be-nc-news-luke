const { selectArticlesById, updateArticlesById } = require('../models/articles-model');

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
