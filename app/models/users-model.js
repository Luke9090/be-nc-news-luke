const knex = require('../../connection');

exports.selectUsers = () => {
  return knex('users')
    .select('username', 'avatar_url', 'name')
    .countDistinct({ comment_count: 'comment_id', article_count: 'title' })
    .leftJoin('articles', 'articles.author', 'username')
    .leftJoin('comments', 'comments.author', 'username')
    .groupBy('username')
    .then(users => {
      return { users };
    });
};

exports.selectUserByUsername = username => {
  return knex('users')
    .select('username', 'avatar_url', 'name')
    .countDistinct({ comment_count: 'comment_id', article_count: 'title' })
    .leftJoin('articles', 'articles.author', 'username')
    .leftJoin('comments', 'comments.author', 'username')
    .groupBy('username')
    .where('username', username)
    .then(userArr => {
      if (userArr.length === 0) return Promise.reject({ status: 404, msg: `Could not find a user with the username '${username}'` });
      else return { user: userArr[0] };
    });
};
