const secret = require("../../config").secret;
const authService = require("../../services/auth");


module.exports = () => {

  let handler = authService.getInstance();
  const decoded = (token) => {
    return new Promise((resolve, reject) => {
      handler.decode(token, secret, (error, data) => {
        if (error) {
          reject(error)
        } else {
          resolve(data);
        }
      });
    });
  }


  return async function colaAuth(ctx, next) {

    if (ctx.method === "HEAD" || ctx.method === "OPTIONS") {
      return await next();
    }

    let matched = false;
    for (let i = 0, l = ctx.app.routeMatcher.length; i < l; i++) {
      let cur = ctx.app.routeMatcher[i];
      if (cur.path != "/" && !cur.ignoreauth && cur.regexp.test(ctx.path)) {
        matched = true;
        break;
      }
    }
    if (matched) {

      const authorization = ctx.get("authorization") || decodeURIComponent(ctx.cookies.get("token"));
      if (!authorization) {
        ctx.throw(401, "Unauthorized");
      } else {
        const token = authorization.replace(/\"/g, "");
        try {

          let code = await decoded(token);
          if (code) {
            ctx.auth = {
              userId: code.userId,
              userName: code.userName
            }
          }
        } catch (err) {
          console.log(err);
          ctx.body = {
            error: true,
            code: -1,
            message: "Invalid token"
          }
          return;
        }
      }
    }

    return await next();
  }
}
