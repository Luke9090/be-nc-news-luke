const { selectUserByUsername, selectUsers } = require('../models/users-model');

exports.getUsers = (req, res, next) => {
  selectUsers()
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
