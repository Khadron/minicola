const LPC = require('../../lpc');
LPC('../test/handler').on("ready", function (comm) {
  comm.hello();
});
