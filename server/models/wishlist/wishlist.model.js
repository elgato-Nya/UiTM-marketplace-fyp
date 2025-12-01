const mongoose = require("mongoose");
const { MAX_WISHLIST_ITEMS } = require("../../utils/enums/cart.enum");
const {
  WishlistValidator,
  wishlistErrorMessages,
} = require("../../validators/wishlist/wishlist.validator");
const AppError = require("../../utils/errors/AppError");
const {
  createNotFoundError,
  createConflictError,
} = require("../../utils/errors");

const WishlistItemSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, wishlistErrorMessages.listingId.required],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    priceWhenAdded: {
      type: Number,
      required: [true, wishlistErrorMessages.priceWhenAdded.required],
    },
  },
  {
    _id: true,
    timestamps: false,
    toJSON: {
      transform: function (doc, ret) {
        // Remove old listingId field if it exists
        delete ret.listingId;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        // Remove old listingId field if it exists
        delete ret.listingId;
        return ret;
      },
    },
  }
);

const WishlistModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, wishlistErrorMessages.userId.required],
      unique: true,
    },
    items: {
      type: [WishlistItemSchema],
      default: [],
      validate: {
        validator: function (items) {
          return WishlistValidator.isValidWishlistLimit(items.length);
        },
        message: wishlistErrorMessages.wishlist.limitReached,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

WishlistModel.index({ "items.listing": 1 });
WishlistModel.index({ "items.addedAt": -1 });

WishlistModel.virtual("totalItems").get(function () {
  return this.items ? this.items.length : 0;
});

// ======================   Instance Methods   ========================

WishlistModel.methods.findItem = function (listingId) {
  return this.items.find(
    (item) => item.listing.toString() === listingId.toString()
  );
};

WishlistModel.methods.addItem = function (listingId, currentPrice) {
  const existingItem = this.findItem(listingId);

  if (existingItem) {
    throw createConflictError(
      wishlistErrorMessages.item.alreadyExists,
      "DUPLICATE_WISHLIST_ITEM"
    );
  }

  if (this.items.length >= MAX_WISHLIST_ITEMS) {
    throw new AppError(wishlistErrorMessages.wishlist.limitReached, 400);
  }

  this.items.push({
    listing: listingId,
    addedAt: new Date(),
    priceWhenAdded: currentPrice,
  });

  return this;
};

WishlistModel.methods.removeItem = function (listingId) {
  const itemIndex = this.items.findIndex(
    (item) => item.listing.toString() === listingId.toString()
  );

  if (itemIndex === -1) {
    throw createNotFoundError("Wishlist item", "WISHLIST_ITEM_NOT_FOUND");
  }

  this.items.splice(itemIndex, 1);
  return this;
};

WishlistModel.methods.clearWishlist = function () {
  this.items = [];
  return this;
};

// ======================   Static Methods   ========================
WishlistModel.statics.findOrCreateWishlist = async function (userId) {
  let wishlist = await this.findOne({ userId });

  if (!wishlist) {
    wishlist = await this.create({ userId, items: [] });
  }

  return wishlist;
};

WishlistModel.statics.getWishlistItemDetails = async function (userId) {
  return this.findOne({ userId }).populate({
    path: "items.listing",
    select: "name type price stock images isAvailable category seller",
  });
};

const Wishlist = mongoose.model("Wishlist", WishlistModel);

module.exports = { Wishlist };
