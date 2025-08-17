// services/user/index.js
const userService = require("./user.service");
const authService = require("./auth.service");
const addressService = require("./address.service");

module.exports = {
  user: userService,
  auth: authService,
  address: addressService,
};

// services/index.js
const userServices = require("./user");
const jwtService = require("./jwt.service");

module.exports = {
  user: userServices,
  jwt: jwtService,
};
