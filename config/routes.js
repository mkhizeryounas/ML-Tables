// Declare all routes in rote config file

var indexRouter = require("../routes/index");
var usersRouter = require("../routes/users");

module.exports = app => {
  app.use("/", indexRouter);
  app.use("/users", usersRouter);
};
