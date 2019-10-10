const { PORT = 9090 } = process.env;

require('./app').listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
