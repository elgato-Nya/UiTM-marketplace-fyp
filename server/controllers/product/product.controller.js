const BaseController = require("../base.controller");
const Product = require("../../models/product/product.model");
const { validationResult } = require("express-validator");
const { AppError } = require("../../utils/errors");
const asyncHandler = require("../../utils/asyncHandler");

/**
 * Product Controller - Function-based approach with BaseController utilities
 *
 * PURPOSE: Handle product CRUD operations
 * PATTERN: Functions + BaseController helpers (Industry Standard for Express)
 * FEATURES: List, create, read, update, delete products
 */

// Create BaseController instance for utility methods
const baseController = new BaseController();

/**
 * Get all products with pagination and filtering
 */
const getProducts = asyncHandler(async (req, res) => {
  baseController.logAction("get_products", req);

  // Use BaseController pagination helper
  const filters = baseController.buildFilters(req.query, [
    "name",
    "category",
    "isActive",
  ]);
  const sort = baseController.buildSort(req.query, [
    "name",
    "price",
    "createdAt",
  ]);

  // Count total for pagination
  const totalProducts = await Product.countDocuments(filters);
  const pagination = baseController.getPagination(req.query, totalProducts);

  // Fetch products
  const products = await Product.find(filters)
    .skip(pagination.skip)
    .limit(pagination.itemsPerPage)
    .sort(sort)
    .populate("createdBy", "profile.username email")
    .select("-__v");

  baseController.logger.info("Products retrieved successfully", {
    count: products.length,
    total: totalProducts,
    filters,
    category: "product_operation",
  });

  return baseController.sendSuccess(
    res,
    { products },
    "Products retrieved successfully",
    200,
    {
      pagination,
    }
  );
}, "get_products");

/**
 * Get single product by ID
 */
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  baseController.logAction("get_product", req, { productId: id });

  const product = await Product.findById(id)
    .populate("createdBy", "profile.username email")
    .select("-__v");

  if (!product) {
    return baseController.sendError(
      res,
      new AppError("Product not found", 404, "PRODUCT_NOT_FOUND"),
      404,
      { productId: id }
    );
  }

  return baseController.sendSuccess(
    res,
    { product },
    "Product retrieved successfully"
  );
}, "get_product");

/**
 * Create new product
 */
const createProduct = asyncHandler(async (req, res) => {
  baseController.logAction("create_product", req);

  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return baseController.sendValidationError(res, errors.array());
  }

  // Create product with user ID
  const productData = {
    ...req.body,
    createdBy: req.user._id,
  };

  const product = await Product.create(productData);

  // Populate creator info for response
  await product.populate("createdBy", "profile.username email");

  baseController.logger.info("Product created successfully", {
    productId: product._id,
    name: product.name,
    createdBy: req.user._id,
    category: "product_operation",
  });

  return baseController.sendSuccess(
    res,
    { product },
    "Product created successfully",
    201
  );
}, "create_product");

/**
 * Update product
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  baseController.logAction("update_product", req, { productId: id });

  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return baseController.sendValidationError(res, errors.array());
  }

  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("createdBy", "profile.username email");

  if (!product) {
    return baseController.sendError(
      res,
      new AppError("Product not found", 404, "PRODUCT_NOT_FOUND"),
      404,
      { productId: id }
    );
  }

  baseController.logger.info("Product updated successfully", {
    productId: product._id,
    name: product.name,
    updatedBy: req.user._id,
    category: "product_operation",
  });

  return baseController.sendSuccess(
    res,
    { product },
    "Product updated successfully"
  );
}, "update_product");

/**
 * Delete product
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  baseController.logAction("delete_product", req, { productId: id });

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return baseController.sendError(
      res,
      new AppError("Product not found", 404, "PRODUCT_NOT_FOUND"),
      404,
      { productId: id }
    );
  }

  baseController.logger.info("Product deleted successfully", {
    productId: product._id,
    name: product.name,
    deletedBy: req.user._id,
    category: "product_operation",
  });

  return baseController.sendSuccess(res, null, "Product deleted successfully");
}, "delete_product");

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
