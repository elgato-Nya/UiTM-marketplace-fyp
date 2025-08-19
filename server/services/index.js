// services/index.js
const userServices = require("./user");
const jwtService = require("./jwt.service");

module.exports = {
  user: userServices,
  jwt: jwtService,
};
