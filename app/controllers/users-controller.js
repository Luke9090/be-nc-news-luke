const { selectUserByUsername, selectUsers, selectUserCommentsByUsername, selectUserValidity } = require('../models/users-model');

exports.getUsers = (req, res, next) => {
  selectUsers(req.query)
    .then(users => {
      res.status(200).send(users);
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  selectUserByUsername(req.params.username)
    .then(user => {
      res.status(200).send(user);
    })
    .catch(next);
};

exports.getUserCommentsByUsername = (req, res, next) => {
  selectUserCommentsByUsername(req.params.username)
    .then(comments => {
      res.status(200).send(comments);
    })
    .catch(next);
};

exports.getUserValidity = (req, res, next) => {
  selectUserValidity(req.params.username).then(exists => {
    res.status(200).send(exists);
  });
};
