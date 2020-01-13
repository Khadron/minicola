const Request = require("request");
const url = require("url");
const fs = require("fs");
const mime = require("../../utils/mime");

module.exports = (config = {}) => {
  let defaultConfig = {
    protocol: "http",
    host: "",
    timeout: 5000,
    gzip: true
  };
  defaultConfig = Object.assign(defaultConfig, config);
  return async function colaProxy(ctx, next) {
    if (ctx.proxy) {
      await next();
      return;
    }
    const proxy = {
      fetch(route, options = {}) {
        return _createRequest(ctx, route, options);
      },
      merge(proxyObjs, callback) {
        let promises = [];
        // eslint-disable-next-line guard-for-in
        for (const key in proxyObjs) {
          const proxyName = key;
          const cur = proxyObjs[key];
          cur.opts = cur.opts || {};
          cur.opts.proxyName = proxyName;
          promises.push(_createRequest(ctx, cur.route, cur.opts));
        }
        return new Promise(resolve => {
          Promise.all(promises).then(function(datas) {
            resolve(callback(datas));
          });
        });
      },
      uploadFiles(route, opts) {
        return _createRequest(ctx, route, opts);
      }
    };
    Object.assign(ctx, {
      proxy
    });
    await next();
  };

  // eslint-disable-next-line complexity
  function _createOptions(route, ctx, opts = {}) {
    const resolvedRoute = _resolveRoute(route);
    const qs = resolvedRoute.qs || ctx.query;
    const uri = url.format({
      protocol: opts.protocol || defaultConfig.protocol || ctx.protocol,
      host: opts.host || defaultConfig.host,
      pathname: encodeURI(
        ctx.captures && ctx.captures.length > 0
          ? `${resolvedRoute.route}/${decodeURI(
              ctx.captures.join("/")
            )}`.replace(/\/\//gm, "/")
          : resolvedRoute.route
      ),
      query: qs
    });
    const curHeaders = { ...ctx.headers};
    const defaultOpts = {
      hostname: opts.host,
      url: uri,
      method: opts.method || ctx.request.method,
      headers: curHeaders,
      gzip: defaultConfig.gzip,
      timeout: opts.timeout || defaultConfig.timeout,
      encoding: opts.encoding || defaultConfig.encoding,
      proxyName: _prettyProxyName(route)
    };

    delete defaultOpts.protocol;
    delete defaultOpts.headers["content-length"];
    delete defaultOpts.headers["if-modified-since"];
    delete defaultOpts.headers.cookie;
    delete defaultOpts.headers.host;
    delete defaultOpts.headers.origin;
    delete defaultOpts.headers.referer;
    delete defaultOpts.headers.authorization;
    defaultOpts.headers["user-agent"] = "mincola";
    defaultOpts.headers["Transfer-Encoding"] = "chunked";
    defaultOpts.headers.userIdentity = defaultOpts.headers.useridentity
      ? defaultOpts.headers.useridentity
      : "";
    defaultOpts.headers.loginName = "";
    defaultOpts.headers.userId = "";

    if (ctx.auth) {
      console.log(`auth info：${ctx.auth}`);
      defaultOpts.headers.userIdentity = ctx.auth.identity;
      defaultOpts.headers.loginName = ctx.auth.userName;
      defaultOpts.headers.userId = ctx.auth.userId;
    }

    if (ctx.is(mime.text)) {
      defaultOpts.body = ctx.request.body;
    } else if (ctx.is(mime.json)) {
      defaultOpts.json = true;
      defaultOpts.body = ctx.request.body;
      Object.assign(defaultOpts.body, opts.params);
    } else if (ctx.is(mime.form)) {
      defaultOpts.form = ctx.request.body;
      Object.assign(defaultOpts.form, opts.params);
    } else if (ctx.is(mime.formData)) {
      const formData = [];
      const files = ctx.request.body.files;
      defaultOpts.formData = {};
      if (Array.isArray(files)) {
        for (const file of files) {
          formData.push({
            value: fs.createReadStream(file.path),
            options: {
              filename: file.name,
              contentType: file.type
            }
          });
        }
      } else if (files.file) {
        formData.push({
          value: fs.createReadStream(files.file.path),
          options: {
            filename: files.file.name,
            contentType: files.file.type
          }
        });
      }

      if (ctx.request.body.fields) {
        Object.assign(defaultOpts.formData, ctx.request.body.fields);
      }

      if (formData.length > 0) {
        defaultOpts.formData.file = formData;
      }

      Object.assign(defaultOpts.formData, opts.params);
    }

    delete opts.params;
    return Object.assign(defaultOpts, opts);
  }

  function _createRequest(ctx, route, cfg) {
    try {
      const opts = _createOptions(route, ctx, cfg);
      console.log("\n-----<http proxy options>-------\n");
      console.log(
        "url=",
        opts.url,
        "method=",
        opts.method,
        "\nheaders=",
        opts.headers,
        "\nbody=",
        opts.body
      );
      console.log("\n-----</http proxy options>-------\n");
      return new Promise(resolve => {
        let size = 0;
        const chunks = [];
        let repType = [];
        if (process.env.DEV) {
          ctx.set(
            "x-application-proxy-name",
            encodeURIComponent(opts.proxyName)
          );
        }
        Request(opts)
          .on("response", function(response) {
            if (!response) {
              throw new Error("reposne is null");
            }
            const rep = response;
            const curHeaders = rep.headers;
            if (!curHeaders) {
              throw new Error("reposne headers is null");
            }
            const type = curHeaders["content-type"];
            if (type) {
              repType = type.split(";");
              ctx.set("content-type", type);
            } else {
              ctx.set(
                "content-type",
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
              );
            }
            if (opts.download) {
              let filename = "download";
              if (rep.headers["content-disposition"]) {
                filename =
                  rep.headers["content-disposition"]
                    .replace("attachment;", "")
                    .replace("filename", "")
                    .replace("=", "")
                    .replace(/\s/gim, "") || "download";
              }
              ctx.set(
                "Content-Disposition",
                `attachment; filename*=UTF-8''${filename}`
              );
              // ctx.set('content-disposition', rep.headers["content-disposition"] || "attachment; filename=download");
            }
          })
          .on("data", function(chunk) {
            size += chunk.length;
            chunks.push(chunk);
          })
          .on("end", function() {
            ctx.set("Content-Length", size);
            ctx.statusCode = 200;
            const bin = Buffer.concat(chunks, size);
            if (repType.indexOf(mime.json) > -1) {
              const str = bin.toString("utf-8");
              const json = {
                error: true,
                message: "",
                data: null,
                code: 0
              };
              try {
                const data = JSON.parse(str);
                if (data) {
                  json.code = data.code;
                  if (data.error) {
                    json.message = data.message || data.error;
                    if (data.status === 500) {
                      console.log(opts.hostname, "服务器内部错误：", data);
                    }
                  } else {
                    if (data.hasOwnProperty("data")) {
                      json.error = !(data.code >= 2000 && data.code < 3000);
                      Object.assign(json, data);
                    } else {
                      Object.assign(json, {
                        data
                      });
                    }
                  }
                }
              } catch (error) {
                console.warn(`[warn] invaild json format:${route}`);
                json.message = "";
                json.data = str;
              }
              return resolve(json);
            }
            return resolve(bin);
          })
          .on("error", function(error) {
            if (error.code === "ETIMEDOUT") {
              if (error.connect === true) {
                error.message = "连接服务器超时";
              } else {
                error.message = "网络原因导致超时";
              }
              console.log(`连接超时：${opts.url}`);
            } else if (error.code === "ESOCKETTIMEDOUT") {
              error.message = "O~ NO！连不上服务器了……";
            }
            return resolve({
              error: true,
              message: error.message,
              data: null
            });
          });
      });
    } catch (error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  }

  function _prettyProxyName(route) {
    return route.replace(/\//g, "-").replace(/^-+|-+$/g, "");
  }

  function _resolveRoute(endRoute) {
    const qsStart = endRoute.indexOf("?");
    const reuslt = {
      qs: {},
      route: endRoute
    };
    if (qsStart > -1) {
      const nqs = endRoute.substring(qsStart + 1);
      const qs = require("querystring");
      reuslt.qs = qs.parse(nqs);
      reuslt.route = endRoute.substring(0, qsStart);
    }
    return reuslt;
  }
};
