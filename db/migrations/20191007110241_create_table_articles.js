exports.up = function(knex) {
  return knex.schema.createTable('articles', articlesTable => {
    articlesTable.increments('article_id');
    articlesTable.string('title');
    articlesTable.text('body');
    articlesTable.integer('votes').defaultTo(0);
    articlesTable.string('topic').references('topics.slug');
    articlesTable
      .string('author')
      .references('users.username')
      .onUpdate('CASCADE');
    articlesTable.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('articles');
};
