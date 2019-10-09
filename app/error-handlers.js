exports.send404 = (req, res, next) => {
  next({ status: 404, msg: 'File or path not found' });
};

exports.sqlError = (err, req, res, next) => {
  switch (err.code) {
    case undefined:
      next(err);
      break;
    case '22P02':
      console.log(err);
      next({ status: 400, msg: 'Invalid input. Database expected a different type of variable.' });
      break;
    case '23503':
      const errDetailRegex = /Key \(author\)=\(([\s\S]+)\) is not present in table "users"/;
      if (err.detail && errDetailRegex.test(err.detail)) {
        const invalidUsername = err.detail.match(errDetailRegex)[1];
        next({ status: 400, msg: `Bad request. The username "${invalidUsername}" does not exist.` });
      } else {
        console.log(err);
        next({ status: 400, msg: 'Bad request. Some of the data you sent needed to match existing data and did not.' });
      }
      break;
    case '42703':
      const errHintRegex = /Perhaps you meant to reference the column "[\w]+.([\w]+)"./;
      if (err.hint && errHintRegex.test(err.hint)) {
        const suggestedCol = err.hint.match(errHintRegex)[1];
        next({ status: 400, msg: `Bad request. Perhaps you meant '${suggestedCol}'` });
      } else {
        next({ status: 400, msg: 'Bad request. Bad column name.' });
      }
      break;
    default:
      console.log('Unhandled SQL error');
      next(err);
  }
};

exports.JSONerror = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    next({ status: 400, msg: 'Error parsing JSON. Make sure you are sending valid JSON data' });
  } else next(err);
};

exports.msgWithStatus = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ err: err.msg });
  } else next(err);
};

exports.otherError = (err, req, res, next) => {
  console.log(err);
  res.sendStatus(500);
};
