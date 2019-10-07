exports.formatDates = list => {
  return list.map(obj => {
    const newObj = { ...obj };
    if (newObj.created_at) newObj.created_at = new Date(newObj.created_at);
    return newObj;
  });
};

exports.makeRefObj = (list, key = 'title', value = 'article_id') => {
  return list.map(obj => {
    const newObj = {};
    newObj[obj[key]] = obj[value];
    return newObj;
  });
};

exports.formatComments = (comments, articleRef) => {
  return comments.map(comment => {
    return { ...comment };
  });
};
