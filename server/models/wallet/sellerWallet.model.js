const mongoose = require("mongoose");

const sellerWalletSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

sellerWalletSchema.methods.credit = function (amount) {
  this.availableBalance += amount;
  return this;
};

sellerWalletSchema.methods.debit = function (amount) {
  this.availableBalance -= amount;
  return this;
};

const SellerWallet = mongoose.model("SellerWallet", sellerWalletSchema);

module.exports = { SellerWallet, sellerWalletSchema };
