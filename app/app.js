const apiRouter = require('./routers/api-router');
const errHandlers = require('./error-handlers');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.all('/*', errHandlers.send404);

app.use(errHandlers.sqlError);
app.use(errHandlers.JSONerror);
app.use(errHandlers.msgWithStatus);
app.use(errHandlers.statusOnly);
app.use(errHandlers.otherError);

module.exports = app;
