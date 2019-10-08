const utils = {};

utils.renameKeys = (obj, ...pairs) => {
  const newObj = { ...obj };
  pairs.forEach(([keyName, newKeyName]) => {
    newObj[newKeyName] = newObj[keyName];
    delete newObj[keyName];
  });
  return newObj;
};

utils.checkId = id => {
  if (!Number(id)) return Promise.reject({ status: 400, msg: `"${id}" is not a valid article ID. Expected a number.` });
  else return Promise.resolve();
};

module.exports = utils;