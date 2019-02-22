const jwt = require("jsonwebtoken");
const secret = require("../../config").secret;

module.exports = {

  decode(token) {

    return jwt.verify(token, secret);
  },
  encode(content, expires) {
    return jwt.sign(content, secret, {
      expiresIn: expires
    });
  }
};
