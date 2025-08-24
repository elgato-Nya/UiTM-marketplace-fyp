const { User } = require("../../models/user");
const logger = require("../../utils/logger");
const { AppError } = require("../../utils/errors");
const {
  handleServiceError,
  handleNotFoundError,
  sanitizeUserData,
} = require("../base.service");

// Simple utility functions for merchant service
const generateSlugFromName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

const sanitizeShopName = (name) => {
  if (!name) return "";
  return name.trim().replace(/\s+/g, " "); // Remove extra spaces
};

/**
 * Merchant Service
 *
 * PURPOSE: Handle merchant-specific business logic and data operations
 * SCOPE: Shop management, merchant verification, shop metrics
 * PATTERN: Individual functions with consistent error handling
 * FEATURES:
 * - Shop creation and updates
 * - Merchant verification management
 * - Shop metrics tracking
 * - Shop search and filtering
 */

/**
 * Create or update merchant details for a user
 */
const createOrUpdateMerchantDetails = async (userId, merchantData) => {
  try {
    logger.info(`Creating/updating merchant details for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      throw handleNotFoundError("User", userId);
    }

    // Ensure user has merchant role
    if (!user.role.includes("merchant")) {
      throw new AppError("User must have merchant role to create shop", 400);
    }

    // Sanitize and prepare merchant data
    const sanitizedData = {
      shopName: sanitizeShopName(merchantData.shopName),
      shopDescription: merchantData.shopDescription?.trim(),
      shopLogo: merchantData.shopLogo?.trim(),
      shopBanner: merchantData.shopBanner?.trim(),
      businessRegistrationNumber:
        merchantData.businessRegistrationNumber?.trim(),
      taxId: merchantData.taxId?.trim(),
      shopCategories: merchantData.shopCategories || [],
    };

    // Generate slug if not provided
    if (!merchantData.shopSlug && sanitizedData.shopName) {
      sanitizedData.shopSlug = generateSlugFromName(sanitizedData.shopName);
    } else if (merchantData.shopSlug) {
      sanitizedData.shopSlug = merchantData.shopSlug.toLowerCase().trim();
    }

    // Check for unique shop name and slug
    if (sanitizedData.shopName) {
      const existingShopName = await User.findOne({
        "merchantDetails.shopName": sanitizedData.shopName,
        _id: { $ne: userId },
      });
      if (existingShopName) {
        throw new AppError("Shop name already exists", 409);
      }
    }

    if (sanitizedData.shopSlug) {
      const existingShopSlug = await User.findOne({
        "merchantDetails.shopSlug": sanitizedData.shopSlug,
        _id: { $ne: userId },
      });
      if (existingShopSlug) {
        throw new AppError("Shop slug already exists", 409);
      }
    }

    // Update merchant details
    user.merchantDetails = { ...user.merchantDetails, ...sanitizedData };

    // Set initial shop status if new merchant
    if (!user.merchantDetails.shopStatus) {
      user.merchantDetails.shopStatus = "pending_verification";
      user.merchantDetails.verificationStatus = "unverified";
    }

    await user.save();

    logger.info(`Merchant details updated for user: ${userId}`);
    return {
      user: sanitizeUserData(user),
      merchantDetails: user.merchantDetails,
    };
  } catch (error) {
    return handleServiceError(error, "createOrUpdateMerchantDetails");
  }
};

/**
 * Get merchant details by user ID
 */
const getMerchantDetails = async (userId) => {
  try {
    logger.info(`Fetching merchant details for user: ${userId}`);

    const user = await User.findById(userId).select("merchantDetails role");
    if (!user) {
      throw handleNotFoundError("User", userId);
    }

    if (!user.role.includes("merchant")) {
      throw new AppError("User is not a merchant", 400);
    }

    return {
      merchantDetails: user.merchantDetails,
      shopUrl: user.merchantDetails.shopUrl,
      isVerified: user.merchantDetails.isVerified,
      isShopActive: user.merchantDetails.isShopActive,
    };
  } catch (error) {
    return handleServiceError(error, "getMerchantDetails");
  }
};

/**
 * Get merchant by shop slug
 */
const getMerchantBySlug = async (shopSlug) => {
  try {
    logger.info(`Fetching merchant by shop slug: ${shopSlug}`);

    const user = await User.findOne({
      "merchantDetails.shopSlug": shopSlug,
      role: "merchant",
    }).select("merchantDetails profile.username profile.avatar");

    if (!user) {
      throw handleNotFoundError("Shop", shopSlug);
    }

    return {
      merchant: {
        username: user.profile.username,
        avatar: user.profile.avatar,
      },
      shop: user.merchantDetails,
    };
  } catch (error) {
    return handleServiceError(error, "getMerchantBySlug");
  }
};

/**
 * Search merchants/shops
 */
const searchMerchants = async (searchQuery, filters = {}, pagination = {}) => {
  try {
    logger.info(`Searching merchants with query: ${searchQuery}`);

    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    // Build search criteria
    const searchCriteria = {
      role: "merchant",
      "merchantDetails.shopStatus": "active",
      "merchantDetails.verificationStatus": "verified",
    };

    // Add text search if query provided
    if (searchQuery) {
      searchCriteria.$or = [
        { "merchantDetails.shopName": { $regex: searchQuery, $options: "i" } },
        {
          "merchantDetails.shopDescription": {
            $regex: searchQuery,
            $options: "i",
          },
        },
        {
          "merchantDetails.shopCategories": {
            $in: [new RegExp(searchQuery, "i")],
          },
        },
      ];
    }

    // Add filters
    if (filters.category) {
      searchCriteria["merchantDetails.shopCategories"] = filters.category;
    }

    if (filters.minRating) {
      searchCriteria["merchantDetails.shopRating.averageRating"] = {
        $gte: parseFloat(filters.minRating),
      };
    }

    // Execute search
    const merchants = await User.find(searchCriteria)
      .select("merchantDetails profile.username profile.avatar")
      .sort({
        "merchantDetails.shopRating.averageRating": -1,
        "merchantDetails.shopMetrics.totalSales": -1,
      })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(searchCriteria);

    return {
      merchants: merchants.map((user) => ({
        merchant: {
          username: user.profile.username,
          avatar: user.profile.avatar,
        },
        shop: user.merchantDetails,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    return handleServiceError(error, "searchMerchants");
  }
};

/**
 * Update shop metrics
 */
const updateShopMetrics = async (userId, metrics) => {
  try {
    logger.info(`Updating shop metrics for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      throw handleNotFoundError("User", userId);
    }

    if (!user.role.includes("merchant")) {
      throw new AppError("User is not a merchant", 400);
    }

    // Update metrics using the schema method
    user.merchantDetails.updateMetrics(metrics);
    await user.save();

    logger.info(`Shop metrics updated for user: ${userId}`);
    return {
      shopMetrics: user.merchantDetails.shopMetrics,
    };
  } catch (error) {
    return handleServiceError(error, "updateShopMetrics");
  }
};

/**
 * Update shop rating
 */
const updateShopRating = async (userId, newRating, isNewReview = true) => {
  try {
    logger.info(`Updating shop rating for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      throw handleNotFoundError("User", userId);
    }

    if (!user.role.includes("merchant")) {
      throw new AppError("User is not a merchant", 400);
    }

    // Update rating using the schema method
    user.merchantDetails.updateRating(newRating, isNewReview);
    await user.save();

    logger.info(`Shop rating updated for user: ${userId}`);
    return {
      shopRating: user.merchantDetails.shopRating,
    };
  } catch (error) {
    return handleServiceError(error, "updateShopRating");
  }
};

/**
 * Update shop status (admin function)
 */
const updateShopStatus = async (userId, status, verificationStatus) => {
  try {
    logger.info(`Updating shop status for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      throw handleNotFoundError("User", userId);
    }

    if (!user.role.includes("merchant")) {
      throw new AppError("User is not a merchant", 400);
    }

    // Update status
    if (status) {
      user.merchantDetails.shopStatus = status;
    }
    if (verificationStatus) {
      user.merchantDetails.verificationStatus = verificationStatus;
    }

    await user.save();

    logger.info(`Shop status updated for user: ${userId}`);
    return {
      shopStatus: user.merchantDetails.shopStatus,
      verificationStatus: user.merchantDetails.verificationStatus,
    };
  } catch (error) {
    return handleServiceError(error, "updateShopStatus");
  }
};

/**
 * Get merchant statistics
 */
const getMerchantStats = async (userId) => {
  try {
    logger.info(`Fetching merchant statistics for user: ${userId}`);

    const user = await User.findById(userId).select("merchantDetails");
    if (!user) {
      throw handleNotFoundError("User", userId);
    }

    if (!user.role.includes("merchant")) {
      throw new AppError("User is not a merchant", 400);
    }

    return {
      shopMetrics: user.merchantDetails.shopMetrics,
      shopRating: user.merchantDetails.shopRating,
      shopStatus: user.merchantDetails.shopStatus,
      verificationStatus: user.merchantDetails.verificationStatus,
      isShopActive: user.merchantDetails.isShopActive,
    };
  } catch (error) {
    return handleServiceError(error, "getMerchantStats");
  }
};

module.exports = {
  createOrUpdateMerchantDetails,
  getMerchantDetails,
  getMerchantBySlug,
  searchMerchants,
  updateShopMetrics,
  updateShopRating,
  updateShopStatus,
  getMerchantStats,
};
