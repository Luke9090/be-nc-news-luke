const { expect } = require('chai');
const utils = require('../app/utils/app-utils');

describe('renameKeys', () => {
  it('returns a new object without mutating the original object', () => {
    const input = { username: 'bob', body: 'comment text' };
    const control = { username: 'bob', body: 'comment text' };
    expect(utils.renameKeys(input, ['username', 'author'])).to.not.equal(input);
    expect(input).to.eql(control);
  });
  it('renames a key in the returned object when passed an object and an array containing a key name and a new key name', () => {
    const input = { username: 'bob', body: 'comment text' };
    const expected = { author: 'bob', body: 'comment text' };
    expect(utils.renameKeys(input, ['username', 'author'])).to.eql(expected);
  });
  it('renames multiple keys in the returned object when passed multiple arrays of key names and new key names', () => {
    const input = { username: 'bob', body: 'comment text' };
    const expected = { author: 'bob', comment: 'comment text' };
    expect(utils.renameKeys(input, ['username', 'author'], ['body', 'comment'])).to.eql(expected);
  });
});
