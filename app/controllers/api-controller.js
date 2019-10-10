const fetchApiJson = require('../models/api-model');

const getApiJson = (req, res, next) => {
  fetchApiJson()
    .then(apiJson => {
      res.status(200).send(apiJson);
    })
    .catch(next);
};

module.exports = getApiJson;
