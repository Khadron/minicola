const path = require("path");
const LPC = require('../../lpc');
console.log("--进入instance--");
module.exports =  LPC(path.join(__dirname, "./tokenHandler"));

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
