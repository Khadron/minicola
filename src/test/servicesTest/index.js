const auth = require('../../services/auth');
auth.getInstance().then((handler) => {
  handler.decode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtoYWRyb24iLCJpYXQiOjE1NTAwMjQ3MTQsImV4cCI6MTU1MDExMTExNH0.wiOAsbEDmRfltPYd9w7cKt3eHPTM7xtU9bHqn11LlEs", "kong", (err, data) => {
    console.log(data);
  });
});
