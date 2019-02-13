const authService = require("../services/auth");
const secret = require("../config").secret;
const model = require("../view_model/home");
let auth = null;

class HomeController {

  constructor() {
    auth = authService.getInstance();
  }

  async helloworldPage() {

    await this.ctx.render("home", {
      title: "cola",
      letter: "hello world!"
    });
  }

  async tokenPage(){
    await this.ctx.render("token", {
      title: "cola"
    });
  }


  async generateToken(userName, userPass) {
    let handler = await auth;
    return new Promise((resolve, reject) => {
      handler.encode({
        userPass,
        userName
      }, secret, "1d", (error, data) => {
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
