const path = require("path");
const fs = require("fs");
const debug = require("debug");
const Router = require("koa-router");
const mainRouter = Router();
const apiRouter = Router({
  prefix: "api"
});
const handleRequest = require('./handleRequest');
const filterType = require('../filterType');

function extractRouteInfo(ctrFilePath, cfgDir) {

  let routeInfos = [],
    ctrlObj = require(ctrFilePath);
  if (ctrlObj) {

    let key = path.basename(ctrFilePath, ".js");
    // let cfgPath = path.join(cfgDir, `${key}.json`);
    // let curConfigs = JSON.parse(fs.readFileSync(cfgPath));

    let cfgPath = `${cfgDir}/${key}.json`.replace(/\/\//gm, "");

    if (fs.existsSync(cfgPath)) {
      let curConfigs = require(cfgPath);
      for (let methodName in curConfigs) {

        if (curConfigs.hasOwnProperty(methodName) === false) {
          continue;
        }

        let cfg = curConfigs[methodName];
        routeInfos.push({
          name: key,
          url: formatRoute(cfg, key),
          method: cfg.method || "get",
          type: cfg.type || "web",
          controller: ctrlObj,
          action: methodName,
          ignoreauth: cfg.ignoreauth
        });
      }
    } else {
      console.warn(`[warn]route config not found - ${cfgPath}`);
    }

  } else {
    console.warn(`[warn]controller info not found - ${ctrFilePath}`);
  }

  return routeInfos;
}

function formatRoute(cfg, defaultRoute) {
  let url = `/${defaultRoute}/`;
  if (cfg.route) {
    url = cfg.route;
  } else {
    if (cfg.pathname) { //默认把controller.js文件名作为路由的一部分
      url = `/${url.replace(/^\/|\/$/g,"")}/${cfg.pathname.replace(/^\/|\/$/g,"")}`
    }
  }
  return url;
}

module.exports = (ctrlFiles, cfgRoot) => {
  try {
    let routeInfos = [];
    cfgRoot = cfgRoot,
      mainRouter.wsRouter = {};

    ctrlFiles.forEach(function (info) {

      if (path.extname(info) !== '.js') {
        return;
      }
      routeInfos = routeInfos.concat(extractRouteInfo(info, cfgRoot));
    });

    mainRouter.wsRouter = {};
    console.log("=== route info:");
    let ignores = {};
    for (let route of routeInfos) {
      debug(`=======mapping=======`);
      let type = route.type.toLowerCase(),
        method = route.method.toLowerCase();
      console.log("* ", route.method, type, route.url, "auth:", route.ignoreauth ? "no" : "yes");

      if (type == filterType.webApi.toLowerCase()) {
        apiRouter[method](route.action, route.url, handleRequest(route));
      } else if (type == filterType.webSocket) {
        mainRouter.wsRouter[`${route.name}-${route.action}`] = route.controller[route.action];
      } else {
        mainRouter[method](route.action, route.url, handleRequest(route));
      }

      ignores[route.action] = route.ignoreauth;
    }
    console.log("===");
    mainRouter.use("/", apiRouter.routes(), apiRouter.allowedMethods());

    mainRouter.stack.forEach((item) => {

      if (ignores[item.name]) {
        item.ignoreauth = ignores[item.name];
      }
    });
    return mainRouter;
  } catch (err) {
    debug(`handleMapping error: ${err}`);
    throw err
  }
}
