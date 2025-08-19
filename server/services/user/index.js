const userService = require("./user.service");
const authService = require("./auth.service");
const addressService = require("./address.service");
const merchantService = require("./merchant.service");

module.exports = {
  user: userService,
  auth: authService,
  address: addressService,
  merchant: merchantService,
};
