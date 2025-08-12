// barrel file for user controllers
const authController = require("./auth.controller");
const userController = require("./user.controller");

module.exports = {
  ...authController,
  ...userController,
};
