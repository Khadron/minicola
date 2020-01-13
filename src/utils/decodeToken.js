const authService = require("../services/auth");
const decoded = (handler, token) => {
  return new Promise((resolve, reject) => {
    handler.decode(token, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = async token => {
  const handler = await authService;
  const code = await decoded(handler, token);
  return code;
};
