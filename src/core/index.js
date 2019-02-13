const fs = require('fs');
const path = require('path');
const http = require("http");
const https = require("https");
const handleRoute = require('./lib/handleRoute');

function traverseDir(dir, result) {

  result = result || [];
  if (path.isAbsolute(dir) === false) {
    dir = path.join(process.cwd(), dir);
  }

  let stat = fs.lstatSync(dir);
  if (stat.isDirectory()) {
    let filenames = fs.readdirSync(dir);
    filenames.forEach(function (cur, index, arr) {
      cur = path.join(dir, cur)
      traverseDir(cur, result);
    })

  } else {
    result.push(dir);
  }

  return result;
}

function generateCtrlFiles(ctrlRoot) {

  let ctrlFiles = [];
  try {
    ctrlFiles = traverseDir(ctrlRoot)
  } catch (error) {
    console.error(error);
  }
  return ctrlFiles;
}

module.exports = (app, options) => {

  options = Object.assign({
    ctrlRoot: path.join(__dirname, "../controller"),
    routeCfgRoot: path.join(__dirname, "../route_config")
  }, options);
  let ctrls = generateCtrlFiles(options.ctrlRoot);
  let route = handleRoute(ctrls, options.routeCfgRoot);
  app.use(route.routes())
    .use(route.allowedMethods());
  app.routeMatcher = route.stack.map((value) => {
    return {
      regexp: value.regexp,
      path: value.path,
      ignoreauth: value.ignoreauth
    }
  });

  if (!app.server) {

    app.server = options.https ? https.createServer(options.https || {}, app.callback()) : http.createServer(app.callback());
    app.listen = function listen() {
      app.server.listen.apply(app.server, arguments);
      return app.server;
    }
  }

  if (options.websocket) {

    console.log("=== websocket:");
    const websocket = require(path.join(__dirname, "./lib/handleWebSocket")),
      ws = new websocket(app.server, route.wsRoute, options.websocket);
    app.ws = ws.init();
    console.dir(app.ws);
    console.log("===");
  }
};
