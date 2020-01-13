const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join("/") +
    " " +
    [hour, minute, second].map(formatNumber).join(":")
  );
};

const formatNumber = n => {
  // eslint-disable-next-line no-param-reassign
  n = n.toString();
  return n[1] ? n : "0" + n;
};

function isType(type) {
  return function(obj) {
    return {}.toString.call(obj) === "[object " + type + "]";
  };
}

const isObject = isType("Object");
const isString = isType("String");
const isArray = Array.isArray || isType("Array");
const isFunction = isType("Function");
const isUndefined = isType("Undefined");

function getClientIp(req) {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress ||
    "";
  if (ip.split(",").length > 0) {
    ip = ip.split(",")[0];
  }
  ip = ip.substr(ip.lastIndexOf(":") + 1, ip.length);
  console.log("ip:" + ip);
  return ip;
}

module.exports = {
  formatTime,
  isType,
  isObject,
  isString,
  isArray,
  isFunction,
  isUndefined,
  getClientIp
};
