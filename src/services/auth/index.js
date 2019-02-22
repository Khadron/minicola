const path = require("path");
const LPC = require('../../lpc');

console.log("进入auth");
// 单例模式
const instance = null;
const getInstance = (function () {
  if (!instance) {
    console.log("进入instance：", instance);
    return LPC(path.join(__dirname, "./tokenHandler"));
  }
  return instance;
})();

module.exports = getInstance;

// ES6
// class AuthServer {

//   static getInstance() {

//     if (!AuthServer.instance) {
//       console.log("进入instance：", instance);
//       AuthServer.instance = LPC(path.join(__dirname, "./tokenHandler"));
//     }
//     return AuthServer.instance;
//   }
// }

// module.exports = AuthServer;
