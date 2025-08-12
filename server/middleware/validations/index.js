// Barrel export for all validation middleware
const authValidation = require("./auth.validation");
const userValidation = require("./user.validation");

module.exports = {
  authValidation,
  userValidation,

  ...authValidation,
  ...userValidation,
};
