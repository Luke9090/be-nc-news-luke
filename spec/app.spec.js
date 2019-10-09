process.env.NODE_ENV = 'test';

const request = require('supertest');
const chai = require('chai');
const { expect } = chai;
chai.use(require('chai-sorted'));
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
      describe('/:article_id', () => {
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
        describe('/:article_id error states', () => {
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
        describe('/comments', () => {
          it('POST / - responds 200 with an object containing a comment object under the key postedComment', () => {
            return request(app)
              .post('/api/articles/2/comments')
              .send({ username: 'rogersop', body: 'FIRST, loooool' })
              .expect(200)
              .then(({ body }) => {
                expect(body).to.have.key('postedComment');
                expect(body.postedComment).to.have.keys('author', 'body', 'comment_id', 'created_at', 'votes', 'article_id');
                const expected = {
                  author: 'rogersop',
                  body: 'FIRST, loooool',
                  comment_id: testData.commentData.length + 1,
                  votes: 0,
                  article_id: 2
                };
                Object.keys(expected).forEach(key => {
                  expect(body.postedComment[key]).to.equal(expected[key]);
                });
                return request(app)
                  .post('/api/articles/2/comments')
                  .send({ username: 'icellusedkars', body: 'SECOND, loooool' })
                  .expect(200);
              })
              .then(({ body }) => {
                expect(body).to.have.key('postedComment');
                expect(body.postedComment).to.have.keys('author', 'body', 'comment_id', 'created_at', 'votes', 'article_id');
                const expected = {
                  author: 'icellusedkars',
                  body: 'SECOND, loooool',
                  comment_id: testData.commentData.length + 2,
                  votes: 0,
                  article_id: 2
                };
                Object.keys(expected).forEach(key => {
                  expect(body.postedComment[key]).to.equal(expected[key]);
                });
                return;
              });
          });
          it('GET / responds 200 with an object containing an array of comment objects under the key comments and a comment_count property', () => {
            return request(app)
              .get('/api/articles/1/comments')
              .expect(200)
              .then(({ body }) => {
                expect(body).to.have.keys('comments', 'comment_count', 'article_id');
                expect(body.comments).to.be.an('array');
                expect(body.article_id).to.equal('1');
                expect(body.comment_count).to.equal(13);
                expect(body.comments.length).to.equal(13);
                body.comments.forEach(comment => {
                  expect(comment).to.have.keys('comment_id', 'votes', 'created_at', 'author', 'body');
                });
              });
          });
          it('GET / responds 200 with the comments array sorted descending by created_at as a default', () => {
            return request(app)
              .get('/api/articles/1/comments')
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.be.descendingBy('created_at');
              });
          });
          it('GET / responds 200 with the comments array sorted descending by column passed as query under key of sort_by', () => {
            const votesReq = request(app)
              .get('/api/articles/1/comments?sort_by=votes')
              .expect(200)
              .then(({ body: { comments } }) => {
                for (let i = 1; i < comments.length; i++) {
                  expect(comments[i].votes).to.be.at.most(comments[i - 1].votes);
                }
              });
            const bodyReq = request(app)
              .get('/api/articles/1/comments?sort_by=body')
              .expect(200)
              .then(({ body: { comments } }) => {
                for (let i = 1; i < comments.length; i++) {
                  const body1 = comments[i - 1].body.toLowerCase();
                  const body2 = comments[i].body.toLowerCase();
                  expect(body2.localeCompare(body1)).to.be.at.most(0);
                }
              });
            return Promise.all([votesReq, bodyReq]);
          });
          it('GET / responds 200 with the comments array sorted ascending by desired property when passed a query of "order=asc"', () => {
            const votesReq = request(app)
              .get('/api/articles/1/comments?sort_by=votes&order=asc')
              .expect(200)
              .then(({ body: { comments } }) => {
                for (let i = 1; i < comments.length; i++) {
                  expect(comments[i].votes).to.be.at.least(comments[i - 1].votes);
                }
              });
            const defaultReq = request(app)
              .get('/api/articles/1/comments?order=asc')
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.be.ascendingBy('created_at');
              });
            const bodyReq = request(app)
              .get('/api/articles/1/comments?sort_by=body&order=asc')
              .expect(200)
              .then(({ body: { comments } }) => {
                for (let i = 1; i < comments.length; i++) {
                  const body1 = comments[i - 1].body.toLowerCase();
                  const body2 = comments[i].body.toLowerCase();
                  expect(body2.localeCompare(body1)).to.be.at.least(0);
                }
              });
            return Promise.all([votesReq, defaultReq, bodyReq]);
          });
          describe('/comments error states', () => {
            describe('POSTing bad JSON', () => {
              it("POST / - responds 400 with error message if sent JSON with username that doesn't exist", () => {
                return request(app)
                  .post('/api/articles/2/comments')
                  .send({ username: 'rogers', body: 'FIRST, loooool' })
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal('Bad request. The username "rogers" does not exist.');
                  });
              });
              it('POST / - responds 400 with error message if sent JSON with one or more of: no username, no body, extra properties', () => {
                const noUsername = request(app)
                  .post('/api/articles/2/comments')
                  .send({ body: 'FIRST, loooool' })
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal('Missing or superfluous keys. The JSON object you send must have keys for body, username and no others');
                  });
                const noBody = request(app)
                  .post('/api/articles/2/comments')
                  .send({ username: 'rogers' })
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal('Missing or superfluous keys. The JSON object you send must have keys for body, username and no others');
                  });
                const extraKeys = request(app)
                  .post('/api/articles/2/comments')
                  .send({ username: 'rogers', body: 'FIRST, loooool', extra: 5 })
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal('Missing or superfluous keys. The JSON object you send must have keys for body, username and no others');
                  });
                const multipleErrs = request(app)
                  .post('/api/articles/2/comments')
                  .send({ extra: 5 })
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal('Missing or superfluous keys. The JSON object you send must have keys for body, username and no others');
                  });
                return Promise.all([noUsername, noBody, extraKeys, multipleErrs]);
              });
              it('POST / - responds 400 with error message if sent syntactically invalid JSON', () => {
                return request(app)
                  .post('/api/articles/1/comments')
                  .send("{ 'inc_count': 3 }")
                  .type('json')
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal('Error parsing JSON. Make sure you are sending valid JSON data');
                  });
              });
            });
            describe('GETS with bad queries', () => {
              it('GET /?sort_by=badColName - responds 400 with error message', () => {
                return request(app)
                  .get('/api/articles/1/comments?sort_by=badColName')
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal('Bad request. Bad column name.');
                  });
              });
              it('GET /?sort_by=closeColName - responds 400 with error message suggesting fix to typo', () => {
                return request(app)
                  .get('/api/articles/1/comments?sort_by=bod')
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal("Bad request. Perhaps you meant 'body'");
                  });
              });
              it('GET /?order=badOrder - responds 400 with error message', () => {
                return request(app)
                  .get('/api/articles/1/comments?order=badOrder')
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal("Bad Request. Order must be either 'asc' or 'desc'");
                  });
              });
              it('GET /?badKey=anything - responds 400 with error message', () => {
                return request(app)
                  .get('/api/articles/1/comments?badKey=anything')
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal("Bad Request. Query keys must be 'order' and/or 'sort_by'");
                  });
              });
            });
            describe('GETs or POSTS under bad articleIds', () => {
              it('GET or POST - /:invalid_article_id/comments - responds 400 with an object containing an error message under the key "err"', () => {
                const getReq = request(app)
                  .get('/api/articles/invalid-article-id/comments')
                  .expect(400)
                  .then(({ body }) => {
                    expect(body).to.have.key('err');
                    expect(body.err).to.eql('"invalid-article-id" is not a valid article ID. Expected a number.');
                  });
                const patchReq = request(app)
                  .post('/api/articles/invalid-article-id/comments')
                  .send({ username: 'rogersop', body: 'some comment' })
                  .expect(400)
                  .then(({ body }) => {
                    expect(body).to.have.key('err');
                    expect(body.err).to.eql('"invalid-article-id" is not a valid article ID. Expected a number.');
                  });
                return Promise.all([getReq, patchReq]);
              });
              it('GET or POST - /:non-existent_article_id - responds 404 with an object containing an error message under the key "err"', () => {
                const getReq = request(app)
                  .get('/api/articles/9999/comments')
                  .expect(404)
                  .then(({ body }) => {
                    expect(body).to.have.key('err');
                    expect(body.err).to.eql('Could not find an article with the article ID "9999".');
                  });
                const patchReq = request(app)
                  .post('/api/articles/9999/comments')
                  .send({ username: 'rogersop', body: 'some comment' })
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
      });
    });
  });
});
