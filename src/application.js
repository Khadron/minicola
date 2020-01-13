const path = require("path");
const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const koaBody = require("koa-body");
const logger = require("koa-log");
const config = require("./config");
const core = require("./core");
const proxy = require("./middlewares/proxy");
const auth = require("./middlewares/auth");
const store = require("./middlewares/store");

module.exports = () => {
  app.use(auth());
  app.use(require("koa-static")(path.join(__dirname, "./public")));
  app.use(
    views(path.join(__dirname, "./views"), {
      extension: "ejs"
    })
  );
  app.use(
    koaBody({
      multipart: true,
      strict: false
    })
  );
  app.use(proxy(config.proxy));
  app.use(json());
  app.use(logger("dev"));
  core(app, config);
  store(app, config.redis);
  onerror(app);
  return app;
};
