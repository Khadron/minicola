const Communicator = require('./communicator');

module.exports = (handlerPath) => {

  return new Promise((resolve, reject) => {
    let communicator = new Communicator(handlerPath);
    console.log("LPC initialization:", communicator.name);
    communicator.on("ready", function (handler) {
      resolve(handler);
    }).on("error", function (err) {
      reject(err)
    });
  });

};
