/* eslint-disable no-useless-escape */
const main = {
  secret: "khadron",
  historyMode: {
    rewrites: [
      {
        from: /\/multipage\/?[^\.]*$/,
        to: "/multipage"
      }
    ],
    ignores: [/^\/$/, /\/token/, /\/download\/*/, /\/exports\/*/]
  },
  sessionTimeout: 60 * 1000 // 秒
};

if (process.env.NODE_ENV === "production") {
  const prod = require("./prod");
  Object.assign(main, prod);
} else if (process.env.NODE_ENV === "test") {
  const test = require("./test");
  Object.assign(main, test);
} else if (process.env.NODE_ENV === "development") {
  const dev = require("./dev");
  Object.assign(main, dev);
} else {
  const local = require("./local");
  Object.assign(main, local);
}

module.exports = main;
