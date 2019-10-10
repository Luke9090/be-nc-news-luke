/*
Make not-nullable:
  articles: title, body, topic, author
  comments: article_id, author, text
*/

exports.up = function(knex) {
  const alterArticles = knex.schema.alterTable('articles', articlesTable => {
    articlesTable
      .string('title')
      .notNullable()
      .alter();
    articlesTable
      .text('body')
      .notNullable()
      .alter();
    articlesTable
      .string('topic')
      .notNullable()
      .alter();
  });
  const alterComments = knex.schema.alterTable('comments', commentsTable => {
    commentsTable
      .string('author')
      .notNullable()
      .alter();
    commentsTable
      .integer('article_id')
      .notNullable()
      .alter();
    commentsTable
      .text('body')
      .notNullable()
      .alter();
  });
  return Promise.all([alterArticles, alterComments]);
};

exports.down = function(knex) {
  const alterArticles = knex.schema.alterTable('articles', articlesTable => {
    articlesTable.string('title').alter();
    articlesTable.text('body').alter();
    articlesTable.string('topic').alter();
  });
  const alterComments = knex.schema.alterTable('comments', commentsTable => {
    commentsTable.string('author').alter();
    commentsTable.integer('article_id').alter();
    commentsTable.text('body').alter();
  });
  return Promise.all([alterArticles, alterComments]);
};
