process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const knex = require('../connection');
const app = require('../app/app');

const testData = require('../db/data');

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
      it('GET /:non-existent-username - responds 404 with an object containing an error message under the key "err"', () => {
        return request(app)
          .get('/api/users/non-existent-user')
          .expect(404)
          .then(({ body }) => {
            expect(body).to.have.key('err');
            expect(body.err).to.eql('Could not find a user with the username "non-existent-user"');
          });
      });
    });
    describe('/articles', () => {
      it('GET /:article_id - responds 200 with an object containing an article object under the key "article"', () => {
        return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.key('article');
            expect(body.article).to.have.keys('author', 'title', 'article_id', 'body', 'topic', 'created_at', 'votes', 'comment_count');
            const expected = {
              author: testData.articleData[0].author,
              title: testData.articleData[0].title,
              article_id: 1,
              body: testData.articleData[0].body,
              topic: testData.articleData[0].topic,
              created_at: '2018-11-15T12:21:54.171Z',
              votes: testData.articleData[0].votes,
              comment_count: '13'
            };
            expect(body.article).to.eql(expected);
          });
      });
      it('PATCH /:article_id - responds 200 with an object containing an article object under the key "updatedArticle"', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 3 })
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.key('updatedArticle');
            expect(body.updatedArticle).to.have.keys('article_id', 'title', 'body', 'votes', 'topic', 'author', 'created_at');
            const expected = {
              article_id: 1,
              title: testData.articleData[0].title,
              body: testData.articleData[0].body,
              votes: testData.articleData[0].votes + 3,
              topic: testData.articleData[0].topic,
              author: testData.articleData[0].author,
              created_at: '2018-11-15T12:21:54.171Z'
            };
            expect(body.updatedArticle).to.eql(expected);
          });
      });
      it('PATCH /:article_id - responds 400 with error message if sent invalid JSON', () => {
        return request(app)
          .patch('/api/articles/1')
          .send("{ 'inc_count': 3 }")
          .type('json')
          .expect(400)
          .then(({ body }) => {
            expect(body.err).to.equal('Error parsing JSON. Make sure you are sending valid JSON data');
          });
      });
      it('GET or PATCH - /:invalid_article_id - responds 400 with an object containing an error message under the key "err"', () => {
        const getReq = request(app)
          .get('/api/articles/invalid-article-id')
          .expect(400)
          .then(({ body }) => {
            expect(body).to.have.key('err');
            expect(body.err).to.eql('"invalid-article-id" is not a valid article ID. Expected a number.');
          });
        const patchReq = request(app)
          .patch('/api/articles/invalid-article-id')
          .send({ inc_votes: 3 })
          .expect(400)
          .then(({ body }) => {
            expect(body).to.have.key('err');
            expect(body.err).to.eql('"invalid-article-id" is not a valid article ID. Expected a number.');
          });
        return Promise.all([getReq, patchReq]);
      });
      it('GET or PATCH - /:non-existent_article_id - responds 404 with an object containing an error message under the key "err"', () => {
        const getReq = request(app)
          .get('/api/articles/9999')
          .expect(404)
          .then(({ body }) => {
            expect(body).to.have.key('err');
            expect(body.err).to.eql('Could not find an article with the article ID "9999".');
          });
        const patchReq = request(app)
          .patch('/api/articles/9999')
          .send({ inc_votes: 3 })
          .expect(404)
          .then(({ body }) => {
            expect(body).to.have.key('err');
            expect(body.err).to.eql('Could not find an article with the article ID "9999".');
          });
        return Promise.all([getReq, patchReq]);
      });
    });
  });
});
