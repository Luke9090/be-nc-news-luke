const utils = {};

utils.renameKeys = (obj, ...pairs) {
  // takes object and arrays of keyName, newKeyName pairs
  // returns new object with each keyName renamed to newKeyName
}

utils.checkId = id => {
  if (!Number(id)) return Promise.reject({ status: 400, msg: `"${id}" is not a valid article ID. Expected a number.` });
  else return Promise.resolve();
};

module.exports = utils;