const _ = {};

_.formatDates = list => {
  return list.map(obj => {
    const newObj = { ...obj };
    if (newObj.created_at) newObj.created_at = new Date(newObj.created_at);
    return newObj;
  });
};

_.makeRefObj = (list, key = 'title', value = 'article_id') => {
  return list.map(obj => {
    const newObj = {};
    newObj[obj[key]] = obj[value];
    return newObj;
  });
};

_.formatComments = (comments, articleRef) => {
  return _.formatDates(comments).map(comment => {
    comment.author = comment.created_by;
    delete comment.created_by;
    comment.article_id = articleRef[comment.belongs_to];
    delete comment.belongs_to;
    return comment;
  });
};

module.exports = _;
