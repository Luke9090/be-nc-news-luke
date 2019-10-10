const knex = require('../../connection');

exports.selectUserByUsername = username => {
  return knex('users')
    .select('*')
    .where('username', username)
    .then(userArr => {
      if (userArr.length === 0) return Promise.reject({ status: 404, msg: `Could not find a user with the username '${username}'` });
      else return { user: userArr[0] };
    });
};
