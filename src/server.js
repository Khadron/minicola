const config = require('./config/index.js');
const app = require('./app');
const port = normalizePort(process.env.PORT || '3389');

process.env.UV_THREADPOOL_SIZE = config.max_pool_size;

console.log("Environment:",process.env.NODE_ENV);
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "local"; //默认本地环境
}
let application = app(config);
const server = application.listen(port, function (err) {

  if (err) {
    console.dir(err);
    return;
  }
  console.log(`\n*----------- Listening at localhost:${port} -----------*\n`);
});

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function setENV() {

  let args = process.argv.splice(2);
  let env = "production";
  if (args.length > 0) {

    let val = args[args.length - 1];
    if (['production', 'development'].indexOf(val) > -1) {
      env = val;
    }
  }
  console.log(env)
  process.env.NODE_ENV = env;

}

module.exports = server;
