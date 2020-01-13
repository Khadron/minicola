const { exec } = require("child_process");

function normalizePort(val) {
  let port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

function printGitInfo() {
  exec("git branch -v", function(err, stdout) {
    if (err) {
      console.log(err);
      return;
    }
    const infos = stdout.split("\n");
    let output = "";
    infos.forEach(info => {
      if (info.indexOf("*") === 0) {
        output = info;
      }
    });

    console.log("\n====== Git info =======");
    console.log(output);
    console.log("=======================\n");
  });
}
printGitInfo();
const port = normalizePort(process.env.PORT || "3669");

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "local"; // 默认本地环境
}
console.log("Environment:", process.env.NODE_ENV);
const app = require("./application");

const application = app();
application.listen(port, function(err) {
  if (err) {
    console.dir(err);
    return;
  }
  console.log(`===========Listening at localhost:${port}==============`);
});
