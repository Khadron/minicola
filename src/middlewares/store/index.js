const redisStore = require("koa-redis");
const Redis = require("ioredis");

module.exports = (app, options) => {
  let instance = null;
  if (process.env.NODE_ENV === "production") {
    instance = new Redis.Cluster(options);
  } else {
    instance = new Redis(options);
  }

  app.store = redisStore({
    client: instance
  });

  app.store.on("connect", info => {
    console.log("store connected");
  });

  app.store.on("ready", info => {
    console.log("store ready");
  });
  app.store.on("error", err => {
    console.error("store error:", err);
  });
};
