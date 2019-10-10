const fs = require('fs');

const fetchApiJson = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('endpoints.json', (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    });
  });
};

module.exports = fetchApiJson;
