// services/index.js
const userServices = require("./user");
const orderServices = require("./order");
const jwtService = require("./jwt.service");
const cartServices = require("./cart");
const wishlistServices = require("./wishlist");

module.exports = {
  user: userServices,
  order: orderServices,
  jwt: jwtService,
  cart: cartServices,
  wishlist: wishlistServices,
};
