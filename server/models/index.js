const { User, Address, Merchant } = require("./user");
const Listing = require("./listing/listing.model");
const {
  Order,
  buyerInfoSchema,
  sellerInfoSchema,
  orderItemSchema,
  deliveryAddressSchema,
} = require("./order");
const { Cart, cartItemSchema } = require("./cart/cart.model");
const { Wishlist } = require("./wishlist/wishlist.model");
const { CheckoutSession } = require("./checkout");
const { MerchantAnalytics, PlatformAnalytics } = require("./analytic");
const { QuoteRequest } = require("./quote");
const { SellerBalance, SellerPayout, BalanceTransaction } = require("./payout");
const { Notification } = require("./notification");

module.exports = {
  // User exports
  User,
  Address,
  Merchant,

  // Listing exports
  Listing,

  // Order exports
  Order,
  buyerInfoSchema,
  sellerInfoSchema,
  orderItemSchema,
  deliveryAddressSchema,

  // Cart exports
  Cart,
  cartItemSchema,

  // Wishlist exports
  Wishlist,

  // Checkout exports
  CheckoutSession,

  // Analytics exports
  MerchantAnalytics,
  PlatformAnalytics,

  // Quote exports
  QuoteRequest,

  // Payout exports
  SellerBalance,
  SellerPayout,
  BalanceTransaction,

  // Notification exports
  Notification,
};
