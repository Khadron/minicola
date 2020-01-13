/* eslint-disable no-useless-constructor */
const authService = require("../services/auth");
const model = require("../view_model/home");
const { formatTime } = require("../utils");

class HomeController {
  constructor() {}

  async helloworldPage() {
    await this.ctx.render("home", {
      title: "mincola",
      letter: "hello world!"
    });
  }

  async tokenPage() {
    await this.ctx.render("token", {
      title: "mincola"
    });
  }

  async generateToken(userName, userPass) {
    model.userName = userName;
    model.userPass = userPass;

    const handler = await authService;
    return new Promise((resolve, reject) => {
      handler.encode(
        {
          content: model,
          exports: "1d"
        },
        (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  async chat(clients, data) {
    // clients 广播
    console.log(">>>client message:", data);
    setInterval(() => {
      this.send(formatTime(new Date()));
    }, 1000);
  }
}

module.exports = new HomeController();
