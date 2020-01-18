# minicola

## 简介
**minicola** 一个基于**koa2**，小而美的**RESTful API** + **MVC**的Web开发框架！
支持websocket和多进程，v3.0新鲜出炉！！！

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

## 更新日志 

### v3.0
0. 鼠年大吉！
1. 更新依赖包版本
2. 更换启动方式，增加starer.js
3. 增加路由命名空间，用于接口版本升级及对路由更小粒度划分
4. 增加handleHistoryMode插件，用来解决单页面应用路由采用history模式下页面刷新造成404问题
5. 改写websocket实现方式，增加websocket应用Demo
6. 代码优化

## 命令

```shell

npm run prod //生产环境启动命令
npm run dev  //开发环境启动命令
npm run test //测试环境启动命令
```

## Hello World!
#### 0.配置application.json（v3.0新增）
```js
{
    // 配置路由相关信息
    "app_routes": [
        {
            "name": "apiv1", // 路由名称
            "prefix": "api", // 对应koa-router的prefix
            "version": "v1" // api版本号
        },
        {
            "name": "apiv2",
            "prefix": "api",
            "version": "v2"
        },
        {
            "name": "isocket",
            "prefix": "cola",
            "upgrade": "ws"
        }
    ],
    "enable_spa_history_mode": true, // 启用支持history方式的前端路由
    "enable_https": false, // 启用https，同certificate配合使用
    "enable_websocket": true,// 启用websocket支持
    "max_pool_size": 16, // 设置libuv线程池的大小
    "certificate": {
        "certPath": null,
        "keyPath": null
    }
}
```
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
  own(新增)：表示当前路由属于哪个命名空间的
*/
{
  "homePage": {
    "route": "/",
    // "pathname":"/"
    "method": "get",
    "type": "web",
    "own":"v1",
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
