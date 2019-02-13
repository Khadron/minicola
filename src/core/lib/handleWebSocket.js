const EventEmitter = require("events").EventEmitter;
const io = require("socket.io");

class WebSocket extends EventEmitter {

  constructor(server, routes, options) {
    super();
    this._socketServer = io(server, options);
    this._routes = routes;
    this._nsp = null;
  }

  init(nspn) {

    let self = this;
    this._nsp = this._socketServer.of(nspn || 'cola');
    this._nsp.use((socket, next) => {
      next();
    });
    this._nsp.on("connection", function (socket) {

      self.emit("connected", socket);
      socket.use((packet, next) => {

        let route = packet.shift();
        if (routes[route]) {
          let result = routes[route].apply(socket, packet);
          if (result) {

            if (result instanceof Promise) {

              result.then(function (data) {
                self.emit("handled", data);
              });
            } else {
              self.emit("handled", result);
            }
          }
        }

        next();
      });

      // socket.on('disconnecting', (reason) => {
      // });

      socket.on('disconnect', (reason) => {
        self.emit("disconnected", reason);
      });

      socket.on('error', (error) => {
        self.emit("error", error);
      });
    });

    return this;
  }

  broadcast(channel, action, data) {
    this._nsp.to(channel).emit(action, data);
    return this;
  }
}

module.exports = WebSocket;
