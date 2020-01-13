/* eslint-disable no-prototype-builtins */
const path = require("path");
const fs = require("fs");
const Router = require("@koa/router");
const mainRouter = Router();
const handleRequest = require("./handleRequest");

function extractRouteInfo(ctrFilePath, cfgDir) {
  const routeInfos = [];
  const ctrlObj = require(ctrFilePath);
  if (ctrlObj) {
    const key = path.basename(ctrFilePath, ".js");
    const cfgPath = `${cfgDir}/${key}.json`.replace(/\/\//gm, "");
    if (fs.existsSync(cfgPath)) {
      const curConfigs = require(cfgPath);
      const keys = Object.keys(curConfigs);
      keys.forEach(methodName => {
        const cfg = curConfigs[methodName];
        routeInfos.push({
          name: key,
          url: formatRoute(cfg, key),
          method: cfg.method || "get",
          own: cfg.own,
          controller: ctrlObj,
          action: methodName,
          ignoreauth: cfg.ignoreauth
        });
      });
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
    if (cfg.pathname) {
      // 默认把controller.js文件名作为路由的一部分
      url = `/${url.replace(/^\/|\/$/g, "")}/${cfg.pathname.replace(
        /^\/|\/$/g,
        ""
      )}`;
    }
  }
  return url;
}

function createRouter(routes) {
  const result = {};
  routes.forEach(route => {
    if (!result[route.name]) {
      let pathname = "";
      if (route.prefix) {
        pathname = route.prefix;
      }
      if (route.version) {
        pathname += "/" + route.version;
      }
      // todo 路由分为两部分，普通的-http，websocket的-ws
      if (route.upgrade) {
        result[route.name] = route;
      } else {
        result[route.name] = Router({
          name: route.name,
          prefix: pathname
        });
      }
    }
  });
  return result;
}

module.exports = (ctrlFiles, config) => {
  try {
    let routeInfos = [];
    ctrlFiles.forEach(function(info) {
      if (path.extname(info) !== ".js") {
        return;
      }
      routeInfos = routeInfos.concat(
        extractRouteInfo(info, config.routeCfgRoot)
      );
    });
    const routerSet = createRouter(config.routes);
    console.log("=== route info: ");
    const ignores = {};
    mainRouter.wsRouter = {};
    for (const route of routeInfos) {
      const own = route.own ? route.own.toLowerCase() : "";
      const method = route.method ? route.method.toLowerCase() : "";
      console.log(
        "* ",
        "own >",
        own || "main",
        method,
        route.url,
        "auth:",
        route.ignoreauth ? "no" : "yes"
      );
      const curRouter = routerSet[own];
      if (curRouter) {
        if (curRouter.upgrade) {
          mainRouter.wsRouter[curRouter.prefix] =
            route.controller[route.action];
        } else {
          curRouter[method](route.action, route.url, handleRequest(route));
        }
      } else {
        mainRouter[method](route.action, route.url, handleRequest(route));
      }
      // if (type === filterType.webApi.toLowerCase()) {
      //   apiRouter[method](route.action, route.url, handleRequest(route));
      // } else if (type == filterType.webSocket) {
      //   mainRouter.wsRouter[`${route.name}-${route.action}`] = route.controller[route.action];
      // } else {
      //   mainRouter[method](route.action, route.url, handleRequest(route));
      // }
      ignores[route.action] = {
        ignore: route.ignoreauth,
        method: route.method === "del" ? "delete" : route.method
      };
    }
    console.log("===");

    Object.keys(routerSet).forEach(key => {
      const curRouter = routerSet[key];
      if (!curRouter.upgrade) {
        mainRouter.use("/", curRouter.routes(), curRouter.allowedMethods());
      }
    });

    mainRouter.stack.forEach(item => {
      if (ignores[item.name]) {
        item.ignoreauth = ignores[item.name];
      }
    });
    return mainRouter;
  } catch (err) {
    console.error(`handleMapping error: ${err}`);
    throw err;
  }
};
