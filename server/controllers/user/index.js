// barrel file for user controllers
const authController = require("./auth.controller");
const userController = require("./user.controller");
const addressController = require("./address.controller");

module.exports = {
  ...authController,
  ...userController,
  ...addressController,
};
