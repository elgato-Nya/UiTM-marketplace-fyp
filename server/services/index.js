// services/index.js
const userServices = require("./user");
const orderServices = require("./order");
const jwtService = require("./jwt.service");
const cartServices = require("./cart");
const wishlistServices = require("./wishlist");
const quoteServices = require("./quote");
const payoutServices = require("./payout");

module.exports = {
  user: userServices,
  order: orderServices,
  jwt: jwtService,
  cart: cartServices,
  wishlist: wishlistServices,
  quote: quoteServices,
  payout: payoutServices,
};
