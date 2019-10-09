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

utils.checkQueryKeys = (query, validKeys) => {
  const validity = Object.keys(query).every(key => validKeys.includes(key));
  if (validity) return Promise.resolve();
  else return Promise.reject({ status: 400, msg: `Bad request. Query can only include the following keys: ${validKeys.join(', ')}` });
};

utils.checkJsonKeys = (query, validKeys) => {
  const validity = Object.keys(query).every(key => validKeys.includes(key));
  if (validity) return Promise.resolve();
  else return Promise.reject({ status: 400, msg: `Bad request. JSON passed in request can only include the following keys: ${validKeys.join(', ')}` });
};

module.exports = utils;
