const { selectArticlesById } = require('../models/articles-model');

exports.getArticlesById = (req, res, next) => {
  selectArticlesById(req.params.article_id)
    .then(article => {
      res.status(200).send(article);
    })
    .catch(next);
};
