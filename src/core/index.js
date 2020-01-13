/* eslint-disable no-param-reassign */
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const appConfig = require("../application.json");
const handleRoute = require("./lib/handleRoute");
const handleWebSocket = require("./lib/handleWebSocket");
const handleSpaMode = require("./lib/handleHistoryMode");

function traverseDir(dir, result) {
  result = result || [];
  if (path.isAbsolute(dir) === false) {
    dir = path.join(process.cwd(), dir);
  }
  const stat = fs.lstatSync(dir);
  if (stat.isDirectory()) {
    const filenames = fs.readdirSync(dir);
    filenames.forEach(function(cur, index, arr) {
      cur = path.join(dir, cur);
      traverseDir(cur, result);
    });
  } else {
    result.push(dir);
  }
  return result;
}

function generateCtrlFiles(ctrlRoot) {
  let ctrlFiles = [];
  try {
    ctrlFiles = traverseDir(ctrlRoot);
  } catch (error) {
    console.error(error);
  }
  return ctrlFiles;
}

module.exports = (app, options) => {
  process.env.UV_THREADPOOL_SIZE = appConfig.max_pool_size;
  const opts = {
    ctrlRoot: path.join(__dirname, "../controller"),
      routeCfgRoot: path.join(__dirname, "../route_config"),
    ...options
  };
  const ctrls = generateCtrlFiles(opts.ctrlRoot);
  const router = handleRoute(ctrls, {
    routes: appConfig.app_routes,
    routeCfgRoot: opts.routeCfgRoot
  });
  app.use(router.routes()).use(router.allowedMethods());
  app.routeMatcher = router.stack.map(value => {
    return {
      regexp: value.regexp,
      path: value.path,
      ignoreauth: value.ignoreauth
    };
  });

  let server = null;
  if (appConfig.enable_https) {
    server = https.createServer(
      {
        cert: fs.readFileSync(appConfig.certificate.certPath),
        key: fs.readFileSync(appConfig.certificate.keyPath)
      },
      app.callback()
    );
  } else {
    server = http.createServer(app.callback());
  }
  app.listen = function listen() {
    server.listen.apply(server, arguments);
    return server;
  };

  if (appConfig.enable_websocket) {
    handleWebSocket(server, router.wsRouter);
  }

  if (appConfig.enable_spa_history_mode) {
    app.middleware.unshift(handleSpaMode());
  }

  if (appConfig.enable_https) {
    const enforceHttps = require("koa-sslify");
    app.middleware.unshift(enforceHttps());
  }

  app.server = server;
};
