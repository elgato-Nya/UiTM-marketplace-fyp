const mongoose = require("mongoose");
const CartItemSchema = require("./cartItem.schema");
const { CartLimits } = require("../../utils/enums/cart.enum");
const {
  CartValidator,
  cartErrorMessages,
} = require("../../validators/cart/cart.validator");
const AppError = require("../../utils/errors/AppError");

const CartModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, cartErrorMessages.userId.required],
      index: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
      validate: {
        validator: function (items) {
          return items.length <= CartLimits.MAX_ITEMS;
        },
        message: cartErrorMessages.cart.limitReached,
      },
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CartModel.index({ "items.listing": 1 });
CartModel.index({ lastActivity: -1 });

CartModel.virtual("totalItems").get(function () {
  return this.items ? this.items.length : 0;
});

CartModel.virtual("totalItemsQuantity").get(function () {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce((total, item) => total + (item.quantity || 0), 0);
});

CartModel.methods.findItem = function (listingId) {
  return this.items.find(
    (item) => item.listing.toString() === listingId.toString()
  );
};

CartModel.methods.addOrUpdateItem = function (listingId, quantity) {
  const existingItem = this.findItem(listingId);

  // Update quantity if item exists, else add new item
  if (existingItem) {
    existingItem.quantity += quantity; // Sum quantities instead of replacing
    existingItem.lastUpdatedAt = Date.now();
  } else {
    if (this.items.length >= CartLimits.MAX_ITEMS) {
      throw new AppError(
        cartErrorMessages.cart.limitReached,
        400,
        "CART_LIMIT_REACHED"
      );
    }
    this.items.push({
      listing: listingId,
      quantity,
      lastUpdatedAt: Date.now(),
      addedAt: Date.now(),
    });
  }
  this.lastActivity = Date.now();
  return this;
};
CartModel.methods.removeItem = function (listingId) {
  const itemIndex = this.items.findIndex(
    (item) => item.listing.toString() === listingId.toString()
  );

  if (itemIndex === -1) {
    throw new AppError(
      cartErrorMessages.item.notFound,
      404,
      "CART_ITEM_NOT_FOUND"
    );
  }

  this.items.splice(itemIndex, 1);
  this.lastActivity = Date.now();
  return this;
};

/**
 * Remove item by cart item ID (subdocument _id)
 * USE CASE: When listing is null/deleted, we only have item._id
 * BEST PRACTICE: Always prefer this over removeItem() for frontend calls
 */
CartModel.methods.removeItemById = function (itemId) {
  const itemIndex = this.items.findIndex(
    (item) => item._id.toString() === itemId.toString()
  );

  if (itemIndex === -1) {
    throw new AppError(
      cartErrorMessages.item.notFound,
      404,
      "CART_ITEM_NOT_FOUND"
    );
  }

  this.items.splice(itemIndex, 1);
  this.lastActivity = Date.now();
  return this;
};

CartModel.methods.clearCart = function () {
  this.items = [];
  this.lastActivity = Date.now();
  return this;
};

CartModel.methods.updateItemQuantity = function (listingId, quantity) {
  const item = this.findItem(listingId);

  if (!item) {
    throw new AppError(
      cartErrorMessages.item.notFound,
      404,
      "CART_ITEM_NOT_FOUND"
    );
  }

  item.quantity = quantity;
  item.lastUpdatedAt = Date.now();
  this.lastActivity = Date.now();
  return this;
};

// ======================   Static Methods   ========================

CartModel.statics.findOrCreateCart = async function (userId) {
  let cart = await this.findOne({ userId });

  if (!cart) {
    cart = await this.create({ userId, items: [], lastActivity: Date.now() });
  }

  return cart;
};

CartModel.statics.getCartWithDetails = async function (userId) {
  return this.findOne({ userId }).populate({
    path: "items.listing",
    select: "name price stock images isAvailable category seller type",
  });
};

const Cart = mongoose.model("Cart", CartModel);

module.exports = { Cart, cartItemSchema: CartItemSchema };
