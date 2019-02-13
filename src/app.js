const path = require("path");
const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const koaBody = require("koa-body");
const logger = require("koa-log");
const core = require("./core");
const proxy = require("./middlewares/proxy");
const auth = require("./middlewares/auth");

module.exports = (config) => {

  app.use(require('koa-static')(path.join(__dirname, './public')));
  app.use(auth());
  app.use(views(path.join(__dirname, './views'), {
    extension: "ejs"
  }));
  app.use(koaBody({
    multipart: true,
    strict: false
  }));
  app.use(json());
  app.use(proxy(config.proxy));
  app.use(logger('dev'));
  core(app, config);
  onerror(app);
  return app;
};
