// Barrel export for all validation middleware
const authValidation = require("./auth.validation");
const userValidation = require("./user.validation");
const addressValidation = require("./address.validation");

module.exports = {
  authValidation,
  userValidation,
  addressValidation,

  ...authValidation,
  ...userValidation,
  ...addressValidation,
};
