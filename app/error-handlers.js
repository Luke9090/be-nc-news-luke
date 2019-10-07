exports.send404 = (req, res, next) => {
  next({ status: 404, msg: 'Error: File or path not found' });
};

exports.msgWithStatus = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send(err.msg);
  } else next(err);
};

exports.sqlError = (err, req, res, next) => {
  next(err);
};

exports.otherError = (err, req, res, next) => {
  console.log(err);
  res.sendStatus(500);
};
