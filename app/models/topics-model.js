const knex = require('../../connection');

exports.selectTopics = () => {
  return knex('topics')
    .select('*')
    .then(topics => {
      return { topics };
    });
};
