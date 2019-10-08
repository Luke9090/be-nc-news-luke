const knex = require('../../connection');

exports.selectUserByUsername = username => {
  return knex('users')
    .select('*')
    .where('username', username)
    .then(([user]) => {
      return { user };
    });
};
