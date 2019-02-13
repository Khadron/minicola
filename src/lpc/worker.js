const path = require("path");
let handlerPath = process.argv.slice(-1)[0],
  modulePath = "";
console.log("handler path:", handlerPath);

if (path.isAbsolute(handlerPath)) {
  modulePath = handlerPath;
} else {
  modulePath = path.join(process.cwd, handlerPath);
}
const handler = require(modulePath);
// console.log(handler);
if (process.send) {
  // console.log("注册");
  process.send({
    action: "register",
    methods: Object.keys(handler)
  });
}

process.on("message", function (message) {
  let ret = {
    success: false,
    rid: message.rid
  };

  const method = message.method;
  if (handler[method]) {
    try {
      const result = handler[method].apply(handler, message.args);
      ret.action = "processing";
      ret.success = true;
      if (result) {

        if (result instanceof Promise) {
          return result.then((data) => {
            ret.data = data;
            process.send(ret);
          }).catch((err) => {
            ret.success = false;
            ret.error = err.message;
            process.send(ret);
          })
        } else {
          ret.data = result;
        }
      }

    } catch (err) {
      ret.success = false;
      ret.error = err.message;
      ret.action = "error";
    }
  }
  process.send(ret);
});


process.on('uncaughtException', (err) => {
  console.error("unknown exception:", err);
  process.exit(1314);
});
