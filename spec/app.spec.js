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
      .delete('/api/articles/3/sdfhjkgsdfk')
      .expect(404)
      .then(({ body }) => {
        expect(body).to.have.key('err');
        expect(body.err).to.equal('File or path not found');
      });
    return Promise.all([req1, req2, req3]);
  });
  it('ALL /validpath with invalid method - responds 405 when trying to use invalid methods on valid paths', () => {
    const req1 = request(app)
      .put('/api/topics')
      .expect(405);
    const req2 = request(app)
      .patch('/api/users/rogersob')
      .expect(405);
    const req3 = request(app)
      .delete('/api')
      .expect(405);
    return Promise.all([req1, req2, req3]);
  });
  describe('/api', () => {
    it('GET / responds 200 with a JSON object documenting available endpoints', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
          expect(body).to.be.an('object');
        });
    });
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
            expect(body.err).to.eql("Could not find a user with the username 'non-existent-user'");
          });
      });
    });
    describe('/articles', () => {
      it('GET / - responds 200 with an array of article objects under the key articles', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body).to.be.an('object');
            expect(body).to.contain.key('articles');
            expect(body.articles).to.be.an('array');
            body.articles.forEach(article => {
              expect(article).to.be.an('object');
            });
          });
      });
      it('GET / - responds 200 and each article object has correct keys', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            articles.forEach(article => {
              expect(article).to.have.keys('author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'comment_count');
            });
          });
      });
      it('GET / - responds 200 and default sorts article array descending by created_at', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.descendingBy('created_at');
          });
      });
      it('GET / - responds 200 and adds an article_count property to the object', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body).to.contain.key('article_count');
            expect(body.articles.length).to.equal(body.article_count);
          });
      });
      it('GET / - responds 200 and sorts article array descending by column under sort_by key in query', () => {
        return request(app)
          .get('/api/articles?sort_by=votes')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.descendingBy('votes');
          });
      });
      it('GET / - responds 200 and sorts article array in the order specified by order key in query', () => {
        const votesAsc = request(app)
          .get('/api/articles?sort_by=votes&order=asc')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.ascendingBy('votes');
          });
        const commentsDesc = request(app)
          .get('/api/articles?sort_by=comment_count&order=desc')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.descendingBy('comment_count');
          });
        return Promise.all([votesAsc, commentsDesc]);
      });
      it('GET / - responds 200 and filters article array by author or topic properties in the query', () => {
        const author = request(app)
          .get('/api/articles?author=icellusedkars')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(6);
            articles.forEach(article => {
              expect(article.author).to.equal('icellusedkars');
            });
          });
        const topic = request(app)
          .get('/api/articles?topic=cats')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(1);
            articles.forEach(article => {
              expect(article.topic).to.equal('cats');
            });
          });
        return Promise.all([author, topic]);
      });
      it('GET / - responds 200 and correctly handles multiple queries', () => {
        return request(app)
          .get('/api/articles?author=rogersop&topic=mitch&sort_by=body')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(2);
            expect(articles[0].title.startsWith('Seven')).to.be.true;
          });
      });
      it('GET / - responds 200 and accepts shortened forms of query keys', () => {
        return request(app)
          .get('/api/articles?a=rogersop&t=mitch&s=body')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(2);
            expect(articles[0].title.startsWith('Seven')).to.be.true;
          });
      });
      it('GET ?limit=5 - responds 200 and only returns 5 results', () => {
        return request(app)
          .get('/api/articles?limit=5')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).to.equal(5);
          });
      });
      it('GET ?limit=5 - still includes full article count', () => {
        return request(app)
          .get('/api/articles?limit=5')
          .then(({ body }) => {
            expect(body.article_count).to.equal(12);
          });
      });
      it('GET ?limit=5&page=2 - responds 200 with the 6th to 10th results', () => {
        return request(app)
          .get('/api/articles')
          .then(({ body }) => {
            const allArticles = body.articles;
            return request(app)
              .get('/api/articles?limit=5&page=2')
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).to.equal(5);
                expect(articles[0]).to.eql(allArticles[5]);
                expect(articles[4]).to.eql(allArticles[9]);
              });
          });
      });
      it('GET ?limit=5&page=3 - responds 200 with the 11th and 12th results', () => {
        return request(app)
          .get('/api/articles')
          .then(({ body }) => {
            const allArticles = body.articles;
            return request(app)
              .get('/api/articles?limit=5&page=3')
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).to.equal(2);
                expect(articles[0]).to.eql(allArticles[10]);
                expect(articles[1]).to.eql(allArticles[11]);
              });
          });
      });
      it('GET ?limit=5&page=2 - responds 200 and includes current page and available pages properties', () => {
        return request(app)
          .get('/api/articles?limit=5&page=2')
          .expect(200)
          .then(({ body }) => {
            expect(body.page).to.equal(2);
            expect(body.available_pages).to.equal(3);
          });
      });
      it('GET ?limit=50 - responds 200 with all available results when the limit is greater than the results, still including page properties', () => {
        return request(app)
          .get('/api/articles?limit=50')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).to.equal(12);
            expect(body.page).to.equal(1);
            expect(body.available_pages).to.equal(1);
          });
      });
      describe('/articles error states', () => {
        it('GET ?limit=5&page=4 - responds 404 with error when too high a page is requested', () => {
          return request(app)
            .get('/api/articles?limit=5&page=4')
            .expect(404)
            .then(({ body }) => {
              expect(body.err).to.equal('Not found. Requested page 4 but there are only 3 pages available.');
            });
        });
        it('GET ?limit=dog - responds 400 with error when non-numerical limit is given in query', () => {
          return request(app)
            .get('/api/articles?limit=dog')
            .expect(400)
            .then(({ body }) => {
              expect(body.err).to.equal('Bad request. Unexpected value for limit in query.');
            });
        });
        it('GET ?limit=0 - responds 400 with error when limit and/or page are zero or below', () => {
          return request(app)
            .get('/api/articles?limit=0')
            .expect(400)
            .then(({ body }) => {
              expect(body.err).to.equal('Bad request. Unexpected value for limit in query.');
            });
        });
        it('GET ?limit=3&page=banana - responds 400 with error when non-numerical limit is given in query', () => {
          return request(app)
            .get('/api/articles?limit=3&page=banana')
            .expect(400)
            .then(({ body }) => {
              expect(body.err).to.equal('Bad request. Unexpected value for page in query.');
            });
        });
        it('GET ?page=2 - responds 400 with error when query contains a page but no limit', () => {
          return request(app)
            .get('/api/articles?page=2')
            .expect(400)
            .then(({ body }) => {
              expect(body.err).to.equal("Bad request. Can't give paginated response if no limit is defined in query");
            });
        });
        it('GET ?badkey=something - responds with 400 and error message', () => {
          return request(app)
            .get('/api/articles?badkey=something')
            .expect(400)
            .then(({ body }) => {
              expect(body.err).to.equal('Bad request. Query can only include the following keys: sort_by, order, author, topic, limit, page');
            });
        });
        it('GET ?sort_by=non-existent-column - responds with 400 and error message', () => {
          return request(app)
            .get('/api/articles?sort_by=non-existent-column')
            .expect(400)
            .then(({ body }) => {
              expect(body.err).to.equal('Bad request. Bad column name.');
            });
        });
        it('GET ?sort_by=nearly-existent-column-typo - responds with 400 and error message with hint', () => {
          return request(app)
            .get('/api/articles?sort_by=authr')
            .expect(400)
            .then(({ body }) => {
              expect(body.err).to.equal("Bad request. Perhaps you meant 'author'");
            });
        });
        it('GET /?order=badOrder - responds 400 with error message', () => {
          return request(app)
            .get('/api/articles?order=badOrder')
            .expect(400)
            .then(({ body }) => {
              expect(body.err).to.equal("Bad request - order must be one of: 'asc', 'desc'");
            });
        });
        it('GET ?filter=non-existent-value - responds with 404 and an error message', () => {
          return request(app)
            .get('/api/articles?author=non-existent-author')
            .expect(404)
            .then(({ body }) => {
              expect(body.err).to.equal('Author or Topic from query not found.');
            });
        });
      });
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
        it('PATCH /:article_id - responds 200 with an object containing an article object under the key "article"', () => {
          return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 3 })
            .expect(200)
            .then(({ body }) => {
              expect(body).to.have.key('article');
              expect(body.article).to.have.keys('article_id', 'title', 'body', 'votes', 'topic', 'author', 'created_at');
              const expected = {
                article_id: 1,
                title: testData.articleData[0].title,
                body: testData.articleData[0].body,
                votes: testData.articleData[0].votes + 3,
                topic: testData.articleData[0].topic,
                author: testData.articleData[0].author,
                created_at: '2018-11-15T12:21:54.171Z'
              };
              expect(body.article).to.eql(expected);
            });
        });
        it('DELETE /:article_id - responds 204', () => {
          return request(app)
            .delete('/api/articles/2')
            .expect(204);
        });
        it('DELETE /:article_id - also deletes comments linked to article', () => {
          return request(app)
            .delete('/api/articles/1')
            .then(() => {
              return request(app)
                .delete('/api/comments/2')
                .expect(404);
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
          it('PATCH / - responds 400 with error message if sent invalid JSON', () => {
            return request(app)
              .patch('/api/articles/1')
              .send("{ 'inc_votes': 3 }")
              .type('json')
              .expect(400)
              .then(({ body }) => {
                expect(body.err).to.equal('Error parsing JSON. Make sure you are sending valid JSON data');
              });
          });
          it('PATCH / - responds 400 with error message if sent invalid keys in JSON', () => {
            return request(app)
              .patch('/api/articles/1')
              .send({ inc_vote: 3 })
              .expect(400)
              .then(({ body }) => {
                expect(body.err).to.equal(`Bad request. JSON passed in request can only include the following keys: inc_votes`);
              });
          });
          it('PATCH / - responds 400 with error message if sent invalid inc_votes value in JSON', () => {
            return request(app)
              .patch('/api/articles/1')
              .send({ inc_votes: 'banana' })
              .expect(400)
              .then(({ body }) => {
                expect(body.err).to.equal('Bad request. The value of inc_votes must be a number.');
              });
          });
          it('GET, PATCH or DELETE - /:invalid_article_id - responds 400 with an object containing an error message under the key "err"', () => {
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
            const delReq = request(app)
              .delete('/api/articles/invalid-article-id')
              .expect(400)
              .then(({ body }) => {
                expect(body).to.have.key('err');
                expect(body.err).to.eql('"invalid-article-id" is not a valid article ID. Expected a number.');
              });
            return Promise.all([getReq, patchReq, delReq]);
          });
          it('GET, PATCH or DELETE - /:non-existent_article_id - responds 404 with an object containing an error message under the key "err"', () => {
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
            const delReq = request(app)
              .delete('/api/articles/9999')
              .expect(404)
              .then(({ body }) => {
                expect(body).to.have.key('err');
                expect(body.err).to.eql('Could not find an article with the article ID "9999".');
              });
            return Promise.all([getReq, patchReq, delReq]);
          });
        });
        describe('/comments', () => {
          it('POST / - responds 201 with an object containing a comment object under the key comment', () => {
            return request(app)
              .post('/api/articles/2/comments')
              .send({ username: 'rogersop', body: 'FIRST, loooool' })
              .expect(201)
              .then(({ body }) => {
                expect(body).to.have.key('comment');
                expect(body.comment).to.have.keys('author', 'body', 'comment_id', 'created_at', 'votes', 'article_id');
                const expected = {
                  author: 'rogersop',
                  body: 'FIRST, loooool',
                  comment_id: testData.commentData.length + 1,
                  votes: 0,
                  article_id: 2
                };
                Object.keys(expected).forEach(key => {
                  expect(body.comment[key]).to.equal(expected[key]);
                });
                return request(app)
                  .post('/api/articles/2/comments')
                  .send({ username: 'icellusedkars', body: 'SECOND, loooool' })
                  .expect(201);
              })
              .then(({ body }) => {
                expect(body).to.have.key('comment');
                expect(body.comment).to.have.keys('author', 'body', 'comment_id', 'created_at', 'votes', 'article_id');
                const expected = {
                  author: 'icellusedkars',
                  body: 'SECOND, loooool',
                  comment_id: testData.commentData.length + 2,
                  votes: 0,
                  article_id: 2
                };
                Object.keys(expected).forEach(key => {
                  expect(body.comment[key]).to.equal(expected[key]);
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
                // Alex troubleshooting
                // console.log(comments);
                // expect(comments).to.be.descendingBy('body');
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
          it('GET / - responds 200 and accepts shortened forms of query keys', () => {
            return request(app)
              .get('/api/articles/1/comments?s=votes&o=asc')
              .expect(200)
              .then(({ body: { comments } }) => {
                for (let i = 1; i < comments.length; i++) {
                  expect(comments[i].votes).to.be.at.least(comments[i - 1].votes);
                }
              });
          });
          it('GET ?limit=5 - responds 200 and only returns 5 results', () => {
            return request(app)
              .get('/api/articles/1/comments?limit=5')
              .expect(200)
              .then(({ body }) => {
                expect(body.comments.length).to.equal(5);
              });
          });
          it('GET ?limit=5 - still includes full comment count', () => {
            return request(app)
              .get('/api/articles/1/comments?limit=5')
              .then(({ body }) => {
                expect(body.comment_count).to.equal(13);
              });
          });
          it('GET ?limit=5&page=2 - responds 200 with the 6th to 10th results', () => {
            return request(app)
              .get('/api/articles/1/comments')
              .then(({ body }) => {
                const allComments = body.comments;
                return request(app)
                  .get('/api/articles/1/comments?limit=5&page=2')
                  .expect(200)
                  .then(({ body: { comments } }) => {
                    expect(comments.length).to.equal(5);
                    expect(comments[0]).to.eql(allComments[5]);
                    expect(comments[4]).to.eql(allComments[9]);
                  });
              });
          });
          it('GET ?limit=5&page=3 - responds 200 with the 11th and 13th results', () => {
            return request(app)
              .get('/api/articles/1/comments')
              .then(({ body }) => {
                const allComments = body.comments;
                return request(app)
                  .get('/api/articles/1/comments?limit=5&page=3')
                  .expect(200)
                  .then(({ body: { comments } }) => {
                    expect(comments.length).to.equal(3);
                    expect(comments[0]).to.eql(allComments[10]);
                    expect(comments[2]).to.eql(allComments[12]);
                  });
              });
          });
          it('GET ?limit=5&page=2 - responds 200 and includes current page and available pages properties', () => {
            return request(app)
              .get('/api/articles/1/comments?limit=5&page=2')
              .expect(200)
              .then(({ body }) => {
                expect(body.page).to.equal(2);
                expect(body.available_pages).to.equal(3);
              });
          });
          it('GET ?limit=50 - responds 200 with all available results when the limit is greater than the results, still including page properties', () => {
            return request(app)
              .get('/api/articles/1/comments?limit=50')
              .expect(200)
              .then(({ body }) => {
                expect(body.comments.length).to.equal(13);
                expect(body.page).to.equal(1);
                expect(body.available_pages).to.equal(1);
              });
          });
          describe('/comments error states', () => {
            describe('POSTing bad JSON', () => {
              it("POST / - responds 404 with error message if sent JSON with username that doesn't exist", () => {
                return request(app)
                  .post('/api/articles/2/comments')
                  .send({ username: 'rogers', body: 'FIRST, loooool' })
                  .expect(404)
                  .then(({ body }) => {
                    expect(body.err).to.equal('Not found. The username "rogers" does not exist.');
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
                    expect(body.err).to.equal("Bad request - order must be one of: 'asc', 'desc'");
                  });
              });
              it('GET /?badKey=anything - responds 400 with error message', () => {
                return request(app)
                  .get('/api/articles/1/comments?badKey=anything')
                  .expect(400)
                  .then(({ body }) => {
                    expect(body.err).to.equal('Bad request. Query can only include the following keys: sort_by, order, author, limit, page');
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
    describe('/comments', () => {
      describe('/:comment_id', () => {
        it('PATCH / responds with 200 and an object containing a comment with updated vote value', () => {
          return request(app)
            .patch('/api/comments/5')
            .send({ inc_votes: 10 })
            .expect(200)
            .then(({ body }) => {
              expect(body).to.have.key('comment');
              const expected = {
                comment_id: 5,
                author: 'icellusedkars',
                article_id: 1,
                votes: 10,
                created_at: '2013-11-23T12:36:03.389Z',
                body: 'I hate streaming noses'
              };
              expect(body.comment).to.eql(expected);
            })
            .then(() => {
              return request(app)
                .patch('/api/comments/5')
                .send({ inc_votes: -15 })
                .expect(200)
                .then(({ body }) => {
                  expect(body).to.have.key('comment');
                  const expected = {
                    comment_id: 5,
                    author: 'icellusedkars',
                    article_id: 1,
                    votes: -5,
                    created_at: '2013-11-23T12:36:03.389Z',
                    body: 'I hate streaming noses'
                  };
                  expect(body.comment).to.eql(expected);
                });
            });
        });
        it('DELETE / responds with 204', () => {
          return request(app)
            .delete('/api/comments/5')
            .expect(204);
        });
        describe('/:comment_id error states', () => {
          it('DELETE /non-existent_comment_id - Responds 404 with error', () => {
            return request(app)
              .delete('/api/comments/9999')
              .expect(404)
              .then(({ body }) => {
                expect(body.err).to.equal('Not found. Could not find a comment with comment_id of "9999"');
              });
          });
          it('DELETE /invalid_comment_id - Responds 400 with error', () => {
            return request(app)
              .delete('/api/comments/sdf')
              .expect(400)
              .then(({ body }) => {
                expect(body.err).to.equal('Bad request. "sdf" is not a valid comment_id. Must be a number.');
              });
          });
          it('PATCH /:non-existent_comment_id - Responds 404 with error', () => {
            return request(app)
              .patch('/api/comments/9999')
              .send({ inc_votes: 10 })
              .expect(404)
              .then(({ body }) => {
                expect(body.err).to.equal('Not found. Could not find a comment with comment_id of "9999"');
              });
          });
          it('PATCH /:invalid_comment_id - Responds 400 with error', () => {
            return request(app)
              .patch('/api/comments/ghfjhgf')
              .send({ inc_votes: 10 })
              .expect(400)
              .then(({ body }) => {
                expect(body.err).to.equal('Bad request. "ghfjhgf" is not a valid comment_id. Must be a number.');
              });
          });
          it('PATCH / - responds 400 with error message if sent invalid JSON', () => {
            return request(app)
              .patch('/api/comments/1')
              .send("{ 'inc_votes': 3 }")
              .type('json')
              .expect(400)
              .then(({ body }) => {
                expect(body.err).to.equal('Error parsing JSON. Make sure you are sending valid JSON data');
              });
          });
          it('PATCH / - responds 400 with error message if sent invalid keys in JSON', () => {
            return request(app)
              .patch('/api/comments/1')
              .send({ inc_vote: 3 })
              .expect(400)
              .then(({ body }) => {
                expect(body.err).to.equal(`Bad request. JSON passed in request can only include the following keys: inc_votes`);
              });
          });
          it('PATCH / - responds 400 with error message if sent invalid inc_votes value in JSON', () => {
            return request(app)
              .patch('/api/comments/1')
              .send({ inc_votes: 'banana' })
              .expect(400)
              .then(({ body }) => {
                expect(body.err).to.equal('Bad request. The value of inc_votes must be a number.');
              });
          });
        });
      });
    });
  });
});
