const mongoose = require("mongoose");

/**
 * Product Model
 *
 * PURPOSE: Basic product schema for e-commerce
 * FEATURES: Name, description, price, category, images, stock
 */

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
      index: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      index: true,
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["electronics", "clothing", "books", "food", "other"],
      index: true,
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ category: 1, isActive: 1, price: 1 });
ProductSchema.index({ createdBy: 1, isActive: 1 });

// Virtual for checking if product is in stock
ProductSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

module.exports = mongoose.model("Product", ProductSchema);
