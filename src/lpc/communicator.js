const path = require("path");
const EventEmitter = require("events").EventEmitter;
const childProcess = require("child_process");
const requestQueue = new Map();
let rid = 0;

function send() {
  rid++;
  const args = Array.prototype.slice.call(arguments);
  const req = {
    rid,
    method: args.slice(0, 1)[0],
    args: args.slice(1, -1),
    callback: null
  };
  if (arguments.length > 1) {
    req.callback = args.slice(-1)[0];
  }
  console.log("*master message:", req);
  requestQueue.set(rid, req);
  // eslint-disable-next-line no-invalid-this
  this.worker.send(req);
}
class Communicator extends EventEmitter {
  constructor(handlerPath) {
    if (!handlerPath) {
      throw new Error("\n\r缺少handlerPath参数");
    }

    if (typeof handlerPath !== "string") {
      throw new Error("\n\r参数handler必须为string类型");
    }

    super();
    this.name = `LPC-${new Date().valueOf()}`;
    this.readyState = "none";
    this.worker = childProcess.fork(path.join(__dirname, "./worker"), [
      handlerPath
    ]);
    this.reconnect();
  }

  reconnect() {
    const self = this;
    if (self.readyState === "none") {
      self.worker
        .on("message", function(res) {
          if (res.action === "register") {
            res.methods.forEach(method => {
              self[method] = send.bind(self, method);
            });
            // console.dir(self);
            self.emit("ready", self);
            self.readyState = "done";
          } else {
            console.log("*slave message:", res);
            const req = requestQueue.get(res.rid);
            const callback = req.callback;

            if (callback) {
              console.log("callback:", callback);
              if (res.success) {
                callback(null, res.data);
              } else {
                callback(new Error(res.error));
              }
            }
          }
        })
        .on("error", function(err) {
          self.emit("error", err);
        });
    } else {
      self.emit("ready", self);
    }
  }

  deleteItem(res) {
    requestQueue.delete(res.rid);
  }
}

module.exports = Communicator;
