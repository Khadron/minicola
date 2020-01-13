const Redis = require("ioredis");
const roomSet = {};

module.exports = (webSocket, config) => {
  if (!webSocket) {
    return;
  }

  const pub = Redis(config.redis);
  const sub = Redis(config.redis);
  let roomId = null;

  webSocket.on("connected", socket => {
    roomId = socket.handshake.query.roomId;
    socket.join(roomId);

    if (!roomSet[roomId]) {
      roomSet[roomId] = {};
      sub.subscribe(roomId);
    }

    roomSet[roomId][socket.id] = {};
  });

  webSocket.on("handled", data => {
    pub.publish(roomId, data);
  });

  webSocket.on("disconnected", reason => {
    console.log(reason);
  });

  webSocket.on("error", error => {
    console.log(error);
  });

  sub.on("subscribe", (channel, count) => {
    console.log("worker pid: " + process.pid + " subscribe: " + channel);
  });

  sub.on("message", (channel, message) => {
    webSocket.broadcast(channel, "message", JSON.parse(message));
  });
};
