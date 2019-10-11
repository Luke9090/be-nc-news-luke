const utils = {};

utils.renameKeys = (obj, ...pairs) => {
  const newObj = { ...obj };
  pairs.forEach(([keyName, newKeyName]) => {
    if (newObj[keyName]) {
      newObj[newKeyName] = newObj[keyName];
      delete newObj[keyName];
    }
  });
  return newObj;
};

utils.checkId = (id, type) => {
  if (!Number(id)) return Promise.reject({ status: 400, msg: `"${id}" is not a valid ${type} ID. Expected a number.` });
  else return Promise.resolve();
};

utils.checkQueryKeys = (query, validation) => {
  // Accepts a query and a validation object with accepted query keys whose values are an array of acceptable values (or a blank array if not testing values), or a predicate function to test the query value with
  const validKeys = Object.keys(validation);
  const validity = Object.keys(query).every(key => validKeys.includes(key));
  if (!validity) return Promise.reject({ status: 400, msg: `Bad request. Query can only include the following keys: ${validKeys.join(', ')}` });
  for (let i = 0; i < validKeys.length; i++) {
    const key = validKeys[i];
    if (query[key] && Array.isArray(validation[key]) && validation[key].length) {
      if (!validation[key].includes(query[key]))
        return Promise.reject({ status: 400, msg: `Bad request - ${key} must be one of: '${validation[key].join("', '")}'` });
    } else if (query[key] && typeof validation[key] === 'function') {
      if (!validation[key](query[key])) return Promise.reject({ status: 400, msg: `Bad request. Unexpected value for ${key} in query.` });
    }
  }
  return Promise.resolve();
};

utils.paginate = (obj, name, limit, page = 1) => {
  const newObj = { ...obj };

  if (page > 1 && page > Math.ceil(newObj[name + '_count'] / limit))
    return Promise.reject({
      status: 404,
      msg: `Not found. Requested page ${page} but there are only ${Math.ceil(newObj[name + '_count'] / limit)} pages available.`
    });

  const start = (page - 1) * limit;
  const end = page * limit;
  newObj[name + 's'] = newObj[name + 's'].slice(start, end);
  newObj.page = Number(page);
  newObj.available_pages = Math.ceil(newObj[name + '_count'] / limit);
  return newObj;
};

utils.isNum = val => {
  return !isNaN(val) && Number(val) > 0;
};

utils.checkJsonKeys = (query, validKeys) => {
  const validity = Object.keys(query).every(key => validKeys.includes(key));
  if (validity) return Promise.resolve();
  else return Promise.reject({ status: 400, msg: `Bad request. JSON passed in request can only include the following keys: ${validKeys.join(', ')}` });
};

utils.checkIncVotes = inc_votes => {
  if (isNaN(inc_votes)) return Promise.reject({ status: 400, msg: `Bad request. The value of inc_votes must be a number.` });
  return Promise.resolve();
};

module.exports = utils;
