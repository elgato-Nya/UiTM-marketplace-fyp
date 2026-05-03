// services/index.js
const userServices = require("./user");
const orderServices = require("./order");
const jwtService = require("./jwt.service");
const cartServices = require("./cart");
const wishlistServices = require("./wishlist");
const quoteServices = require("./quote");
const payoutServices = require("./payout");
const paymentServices = require("./payment");
const planServices = require("./plan/plan.service");
const walletServices = require("./wallet/wallet.service");

module.exports = {
  user: userServices,
  order: orderServices,
  jwt: jwtService,
  cart: cartServices,
  wishlist: wishlistServices,
  quote: quoteServices,
  payout: payoutServices,
  payment: paymentServices,
  plan: planServices,
  wallet: walletServices,
};
