const authService = require("../services/auth");
const model = require("../view_model/home");

class HomeController {

  constructor() {
  }

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

    let handler = await authService;
    return new Promise((resolve, reject) => {
      handler.encode(model, "1d", (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });

  }
}

module.exports = new HomeController()
