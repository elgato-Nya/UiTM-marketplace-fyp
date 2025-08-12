const BaseController = require("../base.controller");
const Product = require("../../models/product/product.model");
const { validationResult } = require("express-validator");

/**
 * Product Controller
 * Handles product CRUD operations
 */

class ProductController extends BaseController {
  constructor() {
    super();
  }

  // Get all products with pagination
  getProducts = this.asyncHandler(async (req, res) => {
    this.logAction("get_products", req);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      const products = await Product.find({ isActive: true })
        .skip(skip)
        .limit(limit)
        .populate("category", "name")
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments({ isActive: true });

      this.logger.info("Products retrieved", {
        page,
        limit,
        total,
        retrieved: products.length,
      });

      return this.sendSuccess(res, {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      return this.sendError(res, error, 500, { action: "get_products" });
    }
  });

  // Get single product
  getProduct = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    this.logAction("get_product", req, { productId: id });

    try {
      const product = await Product.findById(id).populate("category reviews");

      if (!product) {
        return this.sendError(
          res,
          {
            message: "Product not found",
            code: "PRODUCT_NOT_FOUND",
          },
          404
        );
      }

      return this.sendSuccess(res, product);
    } catch (error) {
      return this.sendError(res, error, 500, {
        action: "get_product",
        productId: id,
      });
    }
  });

  // Create product (Admin only)
  createProduct = this.asyncHandler(async (req, res) => {
    this.logAction("create_product", req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return this.sendValidationError(res, errors.array());
    }

    try {
      const product = new Product({
        ...req.body,
        createdBy: req.user._id,
      });

      const savedProduct = await product.save();

      this.logger.info("Product created", {
        productId: savedProduct._id,
        name: savedProduct.name,
        createdBy: req.user._id,
      });

      return this.sendSuccess(
        res,
        savedProduct,
        "Product created successfully",
        201
      );
    } catch (error) {
      return this.sendError(res, error, 500, { action: "create_product" });
    }
  });
}

module.exports = new ProductController();
