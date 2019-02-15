# mincola

## 简介
**mincola** 一个基于**koa2**，小而美的**RESTful API** + **MVC**的Web开发框架！

支持websocket和多进程

## 设计思想

* 约定大于配置
* 精简而优美
* 轻量可扩展
* 追求优雅实现

## 特性

* route与controller自动映射
* controller方法参数自动解析
* 支持多进程(LPC)
* 支持多层路由(web,Api,websocket)
* API鉴权


## 中间件

### Proxy

代理请求模块，可以合并请求，自定义返回结果，一般用于前后端分离

### Auth

API鉴权模块，采用JSON Web Token验证方式，多进程实现

## 运行环境

node version >=8.94

koa >=2.0

## 命令

```shell

npm run prod //生产环境启动命令
npm run dev  //开发环境启动命令
npm run test //测试环境启动命令
```

## Hello world!
#### 1.新建home controller文件，放到controller文件夹中

```js
/*
  controller/home.js
*/

class HomeController {

  constructor() {

  }

  async homePage() {

    await this.ctx.render("home", {
      title: "mincola",
      letter: "hello world!"
    });
  }

}
module.exports = new HomeController()

```

#### 2.新建route文件，放到route_config文件夹中

``` js
/*
  route_config/home.json
  route内容说明：
  type有3中类型：
      web-普通mvc的路由
      webApi-RESTful API的路由
      websocket-websocket的路由
  pathname会在路由中自动添加上controller文件的name。eg:/api/home/token
  route完全自定义路由。eg:/666/token
  method表示请求过来的http方法。eg:GET,POST或DEL
  ignoreauth表示是否忽略对其进行鉴权，true表示忽略接口鉴权行为
*/
{
  "homePage": {
    "route": "/",
    // "pathname":"/"
    "method": "get",
    "type": "web",
    "ignoreauth": true
  }
}

```

#### 3.新建home viewModel文件，放到route_config文件夹中

``` js

/*
  业务实体（模型）
*/

const template = {
  userPass: "",
  userName: ""
};

module.exports = Object.assign({}, template);

```

#### 4.新建home.ejs文件，放到views文件夹中

``` js

<!DOCTYPE html>

<head>
  <title>
    <%= title %>
  </title>
  <style type="text/css">
    div {
      text-align: center;
      margin: 100px;
    }

    ul {
      list-style: none;
    }

  </style>
</head>

<body>
  <div>
    <h1>mincola</h1>
    <p>一个基于koa2，小而美的RESTful API + MVC的web开发框架！</p>
    <h2>
      <%= letter %>
    </h2>
  </div>
</body>

```

#### 5.启动

``` js
/*
  在命令行中执行下面命令
*/
1. npm install

2. npm run dev

```

#### 6.访问 http://localhost:3669/ ,就可以看到home页面了，大功告成
