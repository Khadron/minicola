/* eslint-disable no-prototype-builtins */
const mime = require("../../utils/mime");
const { isObject } = require("../../utils");

function parseArgs(func) {
  let args = func.toString().match(/[function\s|\w\s*].*?\(([^)]*)\)/)[1];
  return args
    .split(",")
    .map(function(arg) {
      // 去除注释和参数默认值
      const key = arg
        .replace(/\/\*.*\*\//, "")
        .replace(/(=\s*.*\s*)+/g, "")
        .trim();
      let value = arg.match(/=\s?(.*)\s?/);
      if (value && value.length > 1) {
        value = value[1].trim();
        if (/^\d+\.\d+$/.test(value)) {
          // 浮点数
          value = parseFloat(value);
        } else if (/^\d+$/.test(value)) {
          // 整数
          value = parseInt(value, 10);
        } else if (/^true|TRUE|True|false|FALSE|False/.test(value)) {
          // bool
          value = value.toLowerCase() === "true";
        } else {
          // 字符串
          value = value
            .replace(/"/g, "")
            .replace(/'/g, "")
            .toString();
        }
      }
      return {
        key,
        value
      };
    })
    .filter(function(args) {
      return args;
    });
}
module.exports = route => {
  const ctrl = route.controller;
  if (!isObject(ctrl)) {
    throw new Error(
      `controller error:\n\r${route.name} controller 导出模块必须为Object类型`
    );
  }
  const action = ctrl[route.action];
  return async (ctx, next) => {
    if (Reflect.has(ctrl, "ctx")) {
      ctrl.ctx = ctx;
    } else {
      Reflect.defineProperty(ctrl, "ctx", {
        value: ctx,
        writable: true
      });
    }
    if (Reflect.has(ctrl, "next")) {
      ctrl.next = next;
    } else {
      Reflect.defineProperty(ctrl, "next", {
        value: next,
        writable: true
      });
    }
    if (!action) {
      console.log(`\n\rNot found ${route.name}-${route.action} method`);
      return next();
    }
    const args = parseArgs(action);
    const reqBody = ctx.request.body;
    const params = [];
    const fileObjs = [];
    let fields = null;
    if (reqBody) {
      if (ctx.is(mime.formData) || ctx.is(mime.stream)) {
        fields = reqBody.fields;
        const files = reqBody.files;
        for (const name in files) {
          if (!files.hasOwnProperty(name)) {
            continue;
          }
          const file = files[name];
          fileObjs.push({
            path: file.path,
            name: file.name,
            type: file.type
          });
        }
      }
    }

    args.forEach((a, index) => {
      const key = a.key;
      if (ctx.query[key]) {
        params.push(ctx.query[key]);
      } else if (key === "files") {
        params.push(fileObjs);
      } else if (fields && fields[key]) {
        params.push(fields[key]);
      } else if (reqBody && reqBody[key]) {
        params.push(reqBody[key]);
      } else {
        params.push(a.value);
      }
    });
    if (params.length === 0) {
      params.push(reqBody || ctx.query);
    }
    try {
      const result = ctrl[route.action].apply(ctrl, params);
      if (result) {
        if (result instanceof Promise) {
          const data = await result;
          if (data) {
            ctx.body = data;
          }
        } else {
          ctx.body = result;
        }
      } else {
        next();
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        ctx.throw(500, error.message, error);
      } else {
        console.error(error);
        await ctx.render("error", {
          title: "Exception",
          code: "500",
          message: " An exception occurred in the application"
        });
      }
    }
  };
};
