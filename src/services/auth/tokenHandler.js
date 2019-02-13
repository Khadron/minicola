const jwt = require("jsonwebtoken");
const secret = require("../../config").secret;

module.exports = {

  decode(token,secret) {

    return jwt.verify(token, secret);
  },
  encode(content, secret, expires) {
    return jwt.sign(content, secret, {
      expiresIn: expires
    });
  }
};
