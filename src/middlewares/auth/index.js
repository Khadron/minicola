const { sessionTimeout } = require("../../config");
const decodeToken = require("../../utils/decodeToken");
const handleAsyncDownloadError = (ctx, data) => {
  if (ctx.headers.asyncdownload) {
    ctx.type = "text/html";
    ctx.body = `<script>window.errorInfo=${JSON.stringify(data)}</script>`;
    return true;
  }
  return false;
};

module.exports = () => {
  return async function colaAuth(ctx, next) {
    if (ctx.method === "HEAD" || ctx.method === "OPTIONS") {
      await next();
      return;
    }
    let matched = false;
    const curMethod = ctx.method.toUpperCase();
    for (let i = 0, l = ctx.app.routeMatcher.length; i < l; i++) {
      const cur = ctx.app.routeMatcher[i];
      if (
        cur.path !== "/" &&
        cur.regexp.test(ctx.path) &&
        !cur.ignoreauth.ignore &&
        curMethod === cur.ignoreauth.method.toUpperCase()
      ) {
        matched = true;
        break;
      }
    }
    if (!matched) {
      return next();
    }
    const authorization =
      ctx.get("authorization") || decodeURIComponent(ctx.cookies.get("token"));
    if (!authorization) {
      ctx.throw(401, "Unauthorized");
    } else {
      const token = authorization.replace(/"/g, "");
      try {
        const code = await decodeToken(token);
        if (code) {
          ctx.auth = {
            userId: code.userId,
            userName: code.userName,
            identity: code.identity
          };
        }
        const store = ctx.app.store;
        const existed = await store.get(code.userName);
        if (existed) {
          await ctx.app.store.set(code.userName, token, sessionTimeout);
        } else {
          const data = {
            error: true,
            code: -1000,
            message: "Session timeout"
          };
          if (handleAsyncDownloadError(ctx, data)) return;
          ctx.body = data;
          return;
        }
      } catch (err) {
        console.log("token解析异常 === ", err);
        const data = {
          error: true,
          code: -1200,
          message: "Invalid token"
        };
        if (handleAsyncDownloadError(ctx, data)) return;
        ctx.body = data;
        return;
      }
    }
  };
};
