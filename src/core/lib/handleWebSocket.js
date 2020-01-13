const url = require("url");
const WebSocket = require("ws");
const { getClientIp } = require("../../utils");

module.exports = (server, routes) => {
  console.log("* enable websocket server");
  const wss = new WebSocket.Server({ noServer: true });
  server.on("upgrade", (request, socket, head) => {
    // console.log('to do auth ', request, socket, head)
    // if (!request.headers.authorization) {
    //   socket.destroy()
    //   return
    // }
    // const pathname = url.parse(request.url).pathname
    // socket.destroy();
    wss.handleUpgrade(request, socket, head, ws => {
      wss.emit("connection", ws, request);
    });
  });

  wss
    .on("connection", (ws, request) => {
      const ip = getClientIp(request);
      console.log("连接成功", ip, request);
      ws.on("message", packet => {
        console.log("packet:", packet);
        let packetObj = null;
        try {
          packetObj = JSON.parse(packet);
        } catch (error) {
          console.log(error);
          return;
        }
        if (!packetObj || !packetObj.target) {
          return;
        }
        const target = routes[packetObj.target];
        if (target) {
          const result = target.apply(ws, [wss.clients, packetObj.data]);
          if (result && result instanceof Promise) {
            result.then(function(data) {
              if (data) {
                // eslint-disable-next-line max-nested-callbacks
                ws.send(JSON.stringify(data), () => {
                  console.log("发送完成");
                });
              }
            });
          } else {
            ws.send(JSON.stringify(result), () => {
              console.log("发送完成");
            });
          }
        }
      })
        .on("close", () => {
          console.log("客户端关闭");
        })
        .on("error", error => {
          console.error(error);
        })
        .on("unexpected-response", (request, response) => {
          console.error("unexpected-response", request, response);
        });
    })
    .on("close", () => {
      console.log("服务器关闭");
    })
    .on("error", error => {
      console.error(error);
    });
};
