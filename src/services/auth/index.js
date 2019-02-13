const path = require("path");
const LPC = require('../../lpc');
const instance = null;

module.exports = {
  getInstance() {
    if (!instance) {
      return LPC(path.join(__dirname, "./tokenHandler"));
    }
    return instance;
  }
}
