const knex = require('../../connection');

exports.selectTopics = () => {
  return knex('topics')
    .select('*')
    .then(topics => {
      return { topics };
    });
};

exports.validateTopic = topic => {
  return knex('topics')
    .select('*')
    .where('slug', topic)
    .then(topics => {
      return { exists: topics.length === 1 };
    });
};
