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
  return !isNaN(val);
};

utils.isPositiveNum = val => {
  return !isNaN(val) && Number(val) > 0;
};

utils.checkProperties = (obj, validation, objType='query') => {
  const validKeys = Object.keys(validation);
  const objKeys = Object.keys(obj);
  const validity = objKeys.every(key => validKeys.includes(key));
  if (!validity) return Promise.reject({ status: 400, msg: `Bad request. ${objType[0].toUpperCase()+objType.slice(1)} can only include the following keys: ${validKeys.join(', ')}` });
  for (let i=0; i<objKeys.length; i++) {
    const currKey = objKeys[i];
    const currValidation = validation[currKey];
    if (Array.isArray(currValidation) && currValidation.length) {
      if (!currValidation.includes(obj[currKey])) return Promise.reject({ status: 400, msg: `Bad request - ${currKey} in ${objType} must be one of: '${currValidation.join("', '")}'` });
    } else if (typeof currValidation === 'function') {
      if (!currValidation(obj[currKey])) return Promise.reject({ status: 400, msg: `Bad request. Unexpected value for ${currKey} in ${objType}.` });
    }
  }
  return Promise.resolve();
};

module.exports = utils;
