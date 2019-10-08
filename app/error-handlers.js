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
