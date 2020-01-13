const path = require("path");
const LPC = require("../../lpc");

const getInstance = (function() {
  if (process.env.NODE_ENV === "local") {
    console.log("*** debug mode ***");
    const handler = require("./tokenHandler");
    return Promise.resolve({
      decode: function(token, callback) {
        return callback(false, handler.decode(token));
      },
      encode: function(opts, callback) {
        return callback(false, handler.encode(opts.content, opts.expires));
      }
    });
  } else {
    return LPC(path.join(__dirname, "./tokenHandler"));
  }
})();
module.exports = getInstance;
