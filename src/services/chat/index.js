var Redis = require('ioredis');
const roomSet = {};

module.exports = (webSocket, config) => {

    if (!webSocket) {
        return;
    }

    let pub = Redis(config.redis),
        sub = Redis(config.redis);

    webSocket.on("connected", (socket) => {

        let roomId = socket.handshake.query.roomId;
        socket.join(roomId);

        if (!roomSet[roomId]) {
            roomSet[roomId] = {};
            sub.subscribe(roomId);
        }

        roomSet[roomId][socket.id] = {};

    });

    webSocket.on("handled", (data) => {
        pub.publish(roomId, {
            "action": route,
            "data": data
        });
    });

    webSocket.on("disconnected", (reason) => {

    });

    webSocket.on("error", (error) => {

    });

    sub.on("subscribe", (channel, count) => {
        console.log('worker pid: ' + process.pid + ' subscribe: ' + channel);
    });

    sub.on("message", (channel, message) => {
        webSocket.broadcast(channel, "message", JSON.parse(message))
    });

}
