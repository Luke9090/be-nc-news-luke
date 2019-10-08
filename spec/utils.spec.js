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
  it('returns an object without mutating the original array or the objects within it', () => {
    const input = [{ article_id: 1, title: 'A' }];
    const control = [{ article_id: 1, title: 'A' }];
    expect(makeRefObj(input)).to.be.an('object');
    expect(makeRefObj(input)).to.not.equal(input);
    expect(control).to.eql(input);
  });
  it('returned object has a key equal to the title property of the first object in the passed array', () => {
    const input = [{ article_id: 1, title: 'A' }];
    expect(makeRefObj(input)).to.contain.key('A');
  });
  it('title property of the returned object is equal to the article_id property of the first object in the passed array', () => {
    const input = [{ article_id: 1, title: 'A' }];
    expect(makeRefObj(input).A).to.equal(1);
  });
  it('returned object has no other keys when passed a single-item array', () => {
    const input = [{ article_id: 1, title: 'A' }];
    expect(makeRefObj(input)).to.have.key('A');
  });
  it('acts on all objects in array', () => {
    const input = [{ article_id: 1, title: 'A' }, { article_id: 5, title: 'Z' }, { article_id: 10, title: 'M' }];
    expect(makeRefObj(input)).to.contain.key('Z');
    expect(makeRefObj(input)).to.contain.key('M');
    expect(makeRefObj(input).Z).to.equal(5);
    expect(makeRefObj(input).M).to.equal(10);
  });
  it('accepts a second parameter (string) which instructs it to choose a different property as the key for the reference object', () => {
    const input = [{ article_id: 1, title: 'A', subtitle: 'B' }];
    expect(makeRefObj(input, 'subtitle')).to.have.key('B');
  });
  it('accepts a third parameter (string) which instructs it to choose a different property as the value for the reference object', () => {
    const input = [{ article_id: 1, title: 'A', subtitle: 'B' }];
    expect(makeRefObj(input, 'subtitle', 'title').B).to.equal('A');
  });
});

describe('formatComments', () => {
  let input, control, refObj, refObjControl;
  beforeEach(() => {
    input = [
      {
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 1511354163389
      },
      {
        body: 'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.',
        belongs_to: 'Living in the shadow of a great man',
        created_by: 'butter_bridge',
        votes: 14,
        created_at: 1479818163389
      },
      {
        body:
          'Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.',
        belongs_to: 'Living in the shadow of a great man',
        created_by: 'icellusedkars',
        votes: 100,
        created_at: 1448282163389
      }
    ];
    control = input.map(obj => {
      return { ...obj };
    });
    refObj = {
      "They're not exactly dogs, are they?": 1,
      'Living in the shadow of a great man': 2
    };
    refObjControl = {
      "They're not exactly dogs, are they?": 1,
      'Living in the shadow of a great man': 2
    };
  });
  it('returns a new array and does not mutate the passed array or any of the objects inside it', () => {
    expect(formatComments(input, refObj)).to.be.an('array');
    expect(formatComments(input, refObj)).to.not.equal(input);
    expect(formatComments(input, refObj)[1]).to.not.equal(input[1]);
    expect(input).to.eql(control);
    expect(refObj).to.eql(refObjControl);
  });
  it('objects in returned array have an author property equal to the created_by properties from the passed array and do not have a created_by key', () => {
    const result = formatComments(input, refObj);
    result.forEach((obj, i) => {
      expect(obj).to.contain.key('author');
      expect(obj.author).to.equal(input[i].created_by);
      expect(obj).to.not.contain.key('created_by');
    });
  });
  it('objects in returned array have an article_id property equal to the relevant value from the passed reference object and do not have a belongs_to key', () => {
    const result = formatComments(input, refObj);
    result.forEach((obj, i) => {
      expect(obj).to.contain.key('article_id');
      expect(obj.article_id).to.equal(refObj[input[i].belongs_to]);
      expect(obj).to.not.contain.key('belongs_to');
    });
  });
  it('created_at property of objects in returned array is a javascript date object', () => {
    const result = formatComments(input, refObj);
    result.forEach((obj, i) => {
      expect(obj).to.contain.key('created_at');
      expect(obj.created_at instanceof Date).to.be.true;
      expect(obj.created_at).to.eql(new Date(input[i].created_at));
    });
  });
  it('all other properties of objects in returned array are equal to those in the passed array', () => {
    const result = formatComments(input, refObj);
    result.forEach((obj, i) => {
      expect(obj).to.contain.keys('body', 'votes');
      expect(obj.body).to.equal(input[i].body);
      expect(obj.votes).to.equal(input[i].votes);
    });
  });
});
