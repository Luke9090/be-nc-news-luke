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

exports.selectUserCommentsByUsername = username => {
  return knex('comments')
    .select('comments.*', 'articles.title AS article_title')
    .where('comments.author', username)
    .leftJoin('articles', 'articles.article_id', 'comments.article_id')
    .then(comments => {
      return { comments };
    });
};
