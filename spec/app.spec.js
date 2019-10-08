process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const knex = require('../connection');
const app = require('../app/app');

describe('/', () => {
  beforeEach(() => knex.seed.run());
  after(() => knex.destroy());
  it('ALL /invalid_paths - responds 404 with an object with key err containing an error message for invalid paths', () => {
    const req1 = request(app)
      .get('/shfdjg')
      .expect(404)
      .then(({ body }) => {
        expect(body).to.have.key('err');
        expect(body.err).to.equal('File or path not found');
      });
    const req2 = request(app)
      .put('/api/sdhjfgsjfg')
      .expect(404)
      .then(({ body }) => {
        expect(body).to.have.key('err');
        expect(body.err).to.equal('File or path not found');
      });
    const req3 = request(app)
      .delete('/kjhfgd')
      .expect(404)
      .then(({ body }) => {
        expect(body).to.have.key('err');
        expect(body.err).to.equal('File or path not found');
      });
    return Promise.all([req1, req2, req3]);
  });
  describe('/api', () => {
    describe('/topics', () => {
      it('GET / - responds 200 with an object containing an array of topics under the key "topics"', () => {
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
    describe('/users', () => {
      it('GET /:username - responds 200 with an object containing a user object under the key "user"', () => {
        return request(app)
          .get('/api/users/rogersop')
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.key('user');
            expect(body.user).to.have.keys('username', 'avatar_url', 'name');
            const expected = { username: 'rogersop', avatar_url: 'https://avatars2.githubusercontent.com/u/24394918?s=400&v=4', name: 'paul' };
            expect(body.user).to.eql(expected);
          });
      });
      it('GET /:invalid_username - responds 404 with an object containing an error message under the key "err"', () => {
        return request(app)
          .get('/api/users/non-existent-user')
          .expect(404)
          .then(({ body }) => {
            expect(body).to.have.key('err');
            expect(body.err).to.eql('Could not find a user with the username "non-existent-user"');
          });
      });
    });
  });
});
