const { expect } = require('chai');
const { formatDates, makeRefObj, formatComments } = require('../db/utils/utils');

describe('formatDates', () => {
  it('returns a new array without mutating the original array', () => {
    const input = [
      {
        title: 'Running a Node App',
        topic: 'coding',
        author: 'jessjelly'
      }
    ];
    const control = [
      {
        title: 'Running a Node App',
        topic: 'coding',
        author: 'jessjelly'
      }
    ];
    expect(formatDates(input)).to.be.an('array');
    expect(formatDates(input)).to.not.equal(input);
    expect(control).to.eql(input);
  });
  it('does not mutate objects within the array', () => {
    const obj1 = {
      title: 'Running a Node App',
      topic: 'coding',
      author: 'jessjelly'
    };
    const obj2 = {
      title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
      topic: 'coding',
      author: 'jessjelly'
    };
    const control1 = {
      title: 'Running a Node App',
      topic: 'coding',
      author: 'jessjelly'
    };
    const control2 = {
      title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
      topic: 'coding',
      author: 'jessjelly'
    };
    const input = [obj1, obj2];
    const control = [control1, control2];
    expect(formatDates(input)[0]).to.not.equal(obj1);
    expect(formatDates(input)[1]).to.not.equal(obj2);
    expect(input).to.eql(control);
  });
  it('objects returned in array have all properties other than "created_at" equal to their original value', () => {
    const input = [
      {
        title: 'Running a Node App',
        topic: 'coding',
        author: 'jessjelly'
      },
      {
        title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
        topic: 'coding',
        author: 'jessjelly'
      }
    ];
    const control = [
      {
        title: 'Running a Node App',
        topic: 'coding',
        author: 'jessjelly'
      },
      {
        title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
        topic: 'coding',
        author: 'jessjelly'
      }
    ];
    expect(formatDates(input)).to.eql(control);
  });
  it('first object returned in array has a created_at value which has been converted to a JS date', () => {
    const input = [
      {
        title: 'Running a Node App',
        topic: 'coding',
        created_at: 1471522072389
      },
      {
        title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
        topic: 'coding',
        created_at: 1500584273256
      }
    ];
    const expected = new Date(1471522072389);
    expect(formatDates(input)[0].created_at).to.eql(expected);
  });
  it('all objects returned in array have a created_at value which has been converted to a JS date', () => {
    const input = [
      {
        title: 'Running a Node App',
        topic: 'coding',
        created_at: 1471522072389
      },
      {
        title: "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
        topic: 'coding',
        created_at: 1500584273256
      }
    ];
    const expected1 = new Date(1471522072389);
    expect(formatDates(input)[0].created_at).to.eql(expected1);
    const expected2 = new Date(1500584273256);
    expect(formatDates(input)[1].created_at).to.eql(expected2);
  });
});

describe('makeRefObj', () => {
  it('returns a new array without mutating the original array or the objects within it', () => {
    const input = [{ article_id: 1, title: 'A' }];
    const control = [{ article_id: 1, title: 'A' }];
    expect(makeRefObj(input)).to.be.an('array');
    expect(makeRefObj(input)).to.not.equal(input);
    expect(control).to.eql(input);
  });
  it('first object in returned array has a key equal to the title property of the first object in the passed array', () => {
    const input = [{ article_id: 1, title: 'A' }];
    expect(makeRefObj(input)[0]).to.contain.key('A');
  });
  it('title property of the first object in the returned array is equal to the article_id property of the first object in the passed array', () => {
    const input = [{ article_id: 1, title: 'A' }];
    expect(makeRefObj(input)[0].A).to.equal(1);
  });
  it('first object in returned array has no other keys', () => {
    const input = [{ article_id: 1, title: 'A' }];
    expect(makeRefObj(input)[0]).to.have.key('A');
  });
});

describe('formatComments', () => {});
