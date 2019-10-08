const apiRouter = require('./routers/api-router');
const errHandlers = require('./error-handlers');

const app = require('express')();

app.use('/api', apiRouter);

app.all('/*', errHandlers.send404);

app.use(errHandlers.sqlError);
app.use(errHandlers.msgWithStatus);
app.use(errHandlers.otherError);

module.exports = app;
