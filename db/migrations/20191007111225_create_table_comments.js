exports.up = function(knex) {
  return knex.schema.createTable('comments', commentsTable => {
    commentsTable.increments('comment_id');
    commentsTable.string('author').references('users.username');
    commentsTable.integer('article_id').references('articles.article_id');
    commentsTable.integer('votes').defaultTo(0);
    commentsTable.timestamp('created_at').defaultTo(knex.fn.now());
    commentsTable.text('body');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('comments');
};
