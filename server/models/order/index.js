const Order = require("./order.model");
const buyerInfoSchema = require("./buyerInfo.schema");
const sellerInfoSchema = require("./sellerInfo.schema");
const orderItemSchema = require("./orderItem.schema");
const deliveryAddressSchema = require("./deliveryAddress.schema");

module.exports = {
  Order,
  buyerInfoSchema,
  sellerInfoSchema,
  orderItemSchema,
  deliveryAddressSchema,
};
