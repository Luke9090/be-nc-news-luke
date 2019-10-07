exports.formatDates = list => {
  return list.map(obj => {
    const newObj = { ...obj };
    if (newObj.created_at) newObj.created_at = new Date(newObj.created_at);
    return newObj;
  });
};

exports.makeRefObj = list => {};

exports.formatComments = (comments, articleRef) => {};
