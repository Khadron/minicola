const main = {
  websocket: {
      path: '/cola',
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false
  },
  https: false,
  max_pool_size: 16,
  secret: "khadron"
};

if (process.env.NODE_ENV == "production") {
  const prod = require('./prod');
  Object.assign(main, prod);
} else if (process.env.NODE_ENV == "test") {
  const test = require('./test');
  Object.assign(main, test);
} else if (process.env.NODE_ENV == "development") {
  const dev = require('./dev');
  Object.assign(main, dev);
} else {

}

module.exports = main;
