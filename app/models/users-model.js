const knex = require('../../connection');

exports.selectUsers = () => {
  return knex('users')
    .select('username', 'avatar_url', 'name')
    .countDistinct({ comment_count: 'comment_id', article_count: 'title' })
    .leftJoin('articles', 'articles.author', 'username')
    .leftJoin('comments', 'comments.author', 'username')
    .groupBy('username')
    .then(users => {
      const commentVotes = knex('comments')
        .select('author')
        .sum({ comment_votes: 'votes' })
        .groupBy('author');
      const articleVotes = knex('articles')
        .select('author')
        .sum({ article_votes: 'votes' })
        .groupBy('author');
      return Promise.all([users, commentVotes, articleVotes]);
    })
    .then(([users, commentVotes, articleVotes]) => {
      users.forEach(user => {
        user.comment_votes = commentVotes.find(voteObj => voteObj.author === user.username).comment_votes;
        user.article_votes = articleVotes.find(voteObj => voteObj.author === user.username).article_votes;
        user.total_votes = parseInt(user.comment_votes) + parseInt(user.article_votes);
      });
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
      else {
        const user = userArr[0];
        return knex('comments')
          .sum({ comment_votes: 'votes' })
          .where('author', user.username)
          .then(data => {
            user.comment_votes = data[0].comment_votes;
            return user;
          });
      }
    })
    .then(user => {
      return knex('articles')
        .sum({ article_votes: 'votes' })
        .where('author', user.username)
        .then(data => {
          user.article_votes = data[0].article_votes;
          user.total_votes = parseInt(user.comment_votes) + parseInt(user.article_votes);
          return { user };
        });
    });
};

exports.selectUserCommentsByUsername = username => {
  return knex('comments')
    .select('comments.*', 'articles.title AS article_title')
    .where('comments.author', username)
    .leftJoin('articles', 'articles.article_id', 'comments.article_id')
    .orderBy('created_at', 'desc')
    .then(comments => {
      return { comments };
    });
};

exports.selectUserValidity = username => {
  return knex('users')
    .select('username')
    .where('username', username)
    .then(users => {
      return { exists: users.length === 1 };
    });
};
