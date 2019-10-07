process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const knex = require('../connection');
const app = require('../app/app');

describe('/', () => {
  beforeEach(() => knex.seed.run());
  after(() => knex.destroy());
  describe('/api', () => {
    describe('/topics', () => {
      it('GET / 200 - responds with an object containing an array of topics under the key "topics"', () => {
        return request(app)
          .get('/api/topics')
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.key('topics');
            expect(body.topics.length).to.equal(3);
            body.topics.forEach(topic => {
              expect(topic).to.have.keys('slug', 'description');
            });
            const expected1 = { slug: 'cats', description: 'Not dogs' };
            expect(body.topics[1]).to.eql(expected1);
          });
      });
    });
  });
});
