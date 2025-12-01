const { User } = require("../../models/user");
const Listing = require("../../models/listing/listing.model");
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
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

const sanitizeShopName = (name) => {
  if (!name) return "";
  return name.trim().replace(/\s+/g, " "); // Remove extra whitespace
};

/**
 * Sync merchant data to all their listings (denormalized fields)
 * @param {string} userId - Merchant's user ID
 * @param {Object} merchantData - Updated merchant data
 * @returns {Promise<Object>} Update result
 */
const syncMerchantDataToListings = async (userId, merchantData) => {
  try {
    logger.info(`Syncing merchant data to listings for user: ${userId}`);

    const updateData = {};

    if (merchantData.username) {
      updateData["seller.username"] = merchantData.username;
    }
    if (merchantData.shopName !== undefined) {
      updateData["seller.shopName"] = merchantData.shopName;
    }
    if (merchantData.shopSlug !== undefined) {
      updateData["seller.shopSlug"] = merchantData.shopSlug;
    }
    if (merchantData.isVerified !== undefined) {
      updateData["seller.isVerifiedMerchant"] = merchantData.isVerified;
    }

    // Only update if there's data to sync
    if (Object.keys(updateData).length === 0) {
      logger.info("No merchant data to sync");
      return { modifiedCount: 0 };
    }

    const result = await Listing.updateMany(
      { "seller.userId": userId },
      { $set: updateData }
    );

    logger.info(`Synced merchant data to ${result.modifiedCount} listings`, {
      userId,
      updatedFields: Object.keys(updateData),
      listingsModified: result.modifiedCount,
    });

    return result;
  } catch (error) {
    logger.error("Failed to sync merchant data to listings", {
      userId,
      error: error.message,
    });
    // Don't throw - sync failure shouldn't block merchant update
    return { modifiedCount: 0, error: error.message };
  }
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
 * Auto-create shop from user's existing profile data
 * Called when merchant first accesses shop features
 */
const autoCreateShopFromProfile = async (userId) => {
  try {
    logger.info(`Auto-creating shop for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      throw handleNotFoundError("User", userId);
    }

    // Check if shop already exists
    if (user.merchantDetails && user.merchantDetails.shopName) {
      logger.info(`Shop already exists for user: ${userId}`);
      return {
        user: sanitizeUserData(user),
        merchantDetails: user.merchantDetails,
        isNew: false,
      };
    }

    // Ensure user has merchant role
    if (!user.roles.includes("merchant")) {
      throw new AppError("User must have merchant role to create shop", 400);
    }

    // Generate shop data from user profile
    const username = user.profile.username;
    const baseShopName = `${username}'s Shop`;
    const baseSlug = `${username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")}-shop`;

    // Ensure unique shop name and slug
    let shopName = baseShopName;
    let shopSlug = baseSlug;
    let counter = 1;

    // Check uniqueness and add counter if needed
    while (
      await User.findOne({
        "merchantDetails.shopSlug": shopSlug,
        _id: { $ne: userId },
      })
    ) {
      shopSlug = `${baseSlug}-${counter}`;
      shopName = `${baseShopName} ${counter}`;
      counter++;
    }

    // Create minimal shop with user's data
    user.merchantDetails = {
      shopName,
      shopSlug,
      shopDescription: user.profile.bio || `Welcome to ${shopName}!`,
      shopStatus: "active", // Active immediately (soft verification)
      verificationStatus: "unverified", // Can be verified by admin later
      shopCategories: [], // Removed as per decision
      shopRating: {
        averageRating: 0,
        totalReviews: 0,
      },
      shopMetrics: {
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
      },
    };

    await user.save();

    logger.info(`Shop auto-created for user: ${userId}`, {
      shopName,
      shopSlug,
    });

    return {
      user: sanitizeUserData(user),
      merchantDetails: user.merchantDetails,
      isNew: true,
    };
  } catch (error) {
    return handleServiceError(error, "autoCreateShopFromProfile");
  }
};

/**
 * Get or create shop (ensures shop exists)
 * Use this before showing shop dashboard
 */
const getOrCreateShop = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw handleNotFoundError("User", userId);
    }

    if (!user.roles.includes("merchant")) {
      throw new AppError("User must have merchant role", 400);
    }

    // If shop doesn't exist, auto-create it
    if (!user.merchantDetails || !user.merchantDetails.shopName) {
      return await autoCreateShopFromProfile(userId);
    }

    // Return existing shop
    return {
      user: sanitizeUserData(user),
      merchantDetails: user.merchantDetails,
      isNew: false,
    };
  } catch (error) {
    return handleServiceError(error, "getOrCreateShop");
  }
};

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
    if (!user.roles.includes("merchant")) {
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

    // Update merchant details - only update provided fields
    Object.keys(sanitizedData).forEach((key) => {
      if (sanitizedData[key] !== undefined) {
        user.merchantDetails[key] = sanitizedData[key];
      }
    });

    // Set initial shop status if new merchant
    if (!user.merchantDetails.shopStatus) {
      user.merchantDetails.shopStatus = "pending_verification";
      user.merchantDetails.verificationStatus = "unverified";
    }

    // Save with validation only on modified fields
    await user.save({ validateModifiedOnly: true });

    // Sync updated merchant data to all listings (denormalized fields)
    if (
      sanitizedData.shopName ||
      sanitizedData.shopSlug ||
      merchantData.username
    ) {
      await syncMerchantDataToListings(userId, {
        username: user.profile.username,
        shopName: user.merchantDetails.shopName,
        shopSlug: user.merchantDetails.shopSlug,
        isVerified: user.merchantDetails.isVerified || false,
      });
    }

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

    const user = await User.findById(userId).select("merchantDetails roles");
    if (!user) {
      throw handleNotFoundError("User", userId);
    }

    if (!user.roles.includes("merchant")) {
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
      roles: "merchant",
    }).select("merchantDetails profile.username profile.avatar");

    if (!user) {
      throw handleNotFoundError("Shop", shopSlug);
    }

    return {
      merchant: {
        _id: user._id, // Include user ID for fetching seller listings
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
      roles: "merchant",
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
      ];
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

    if (!user.roles.includes("merchant")) {
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

    if (!user.roles.includes("merchant")) {
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

    if (!user.roles.includes("merchant")) {
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

    const user = await User.findById(userId).select("merchantDetails roles");
    if (!user) {
      throw handleNotFoundError("User", userId);
    }

    if (!user.roles.includes("merchant")) {
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

/**
 * Track shop view (increment view count)
 * @param {string} shopSlug - Shop slug identifier
 * @returns {Promise<Object>} Updated view count
 */
const trackShopView = async (shopSlug) => {
  try {
    logger.info(`Tracking view for shop: ${shopSlug}`);

    const user = await User.findOneAndUpdate(
      {
        "merchantDetails.shopSlug": shopSlug,
        roles: "merchant",
      },
      {
        $inc: { "merchantDetails.shopMetrics.totalViews": 1 },
      },
      {
        new: true,
        select: "merchantDetails.shopMetrics.totalViews",
      }
    );

    if (!user) {
      throw handleNotFoundError("Shop", shopSlug);
    }

    return {
      totalViews: user.merchantDetails.shopMetrics.totalViews,
      shopSlug,
    };
  } catch (error) {
    return handleServiceError(error, "trackShopView");
  }
};

module.exports = {
  autoCreateShopFromProfile,
  getOrCreateShop,
  createOrUpdateMerchantDetails,
  getMerchantDetails,
  getMerchantBySlug,
  searchMerchants,
  updateShopMetrics,
  updateShopRating,
  updateShopStatus,
  getMerchantStats,
  trackShopView,
  syncMerchantDataToListings,
};
