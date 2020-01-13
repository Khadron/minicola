const mime = require("../../utils/mime");
const config = require("../../config");
const logger = console.log;
const opts = config.historyMode;

function isHtml(accept) {
  const htmlAccept = [
    "text/html",
    "application/xhtml+xml",
    "application/xml",
    "*/*"
  ];
  const acceptArr = accept.replace(/;/g, ",").split(",");
  for (let i = 0; i < acceptArr.length; i++) {
    if (htmlAccept.indexOf(acceptArr[i]) > -1) {
      return true;
    }
  }
  return false;
}

module.exports = () => {
  return async function intercept(ctx, next) {
    const header = ctx.req.headers;
    const pathname = ctx.path;
    if (
      ctx.method !== "GET" ||
      !header ||
      typeof header.accept !== "string" ||
      header.accept.indexOf(mime.json) > -1 ||
      !isHtml(header.accept) ||
      pathname.lastIndexOf(".") > pathname.lastIndexOf("/")
    ) {
      /* not GET
       * json
       * the client did not send an HTTP accept header
       * the client does not accept HTML
       * static files
       * */
      return next();
    }
    let rewriteValue = "/index.html";
    for (let i = 0, il = opts.ignores.length; i < il; i++) {
      const ignore = opts.ignores[i];
      if (pathname.match(ignore)) {
        logger("Ignore Path", ctx.method, ctx.url, "to", rewriteValue);
        return next();
      }
    }
    for (let i = 0; i < opts.rewrites.length; i++) {
      let rewrite = opts.rewrites[i];
      let match = pathname.match(rewrite.from);
      if (match !== null) {
        const to = rewrite.to;
        if (typeof to === "string") {
          rewriteValue = to;
        } else if (typeof to === "function") {
          rewriteValue = to(ctx.req, match);
        }
        break;
      }
    }
    logger("Rewriting", ctx.method, ctx.url, "to", rewriteValue);
    ctx.url = rewriteValue;
    return next();
  };
};
