const { User } = require("../../models/user");
const logger = require("../../utils/logger");
const { AppError } = require("../../utils/errors");
const BaseController = require("../base.controller");
const asyncHandler = require("../../utils/asyncHandler");
const Fuse = require("fuse.js");

/**
 * Admin Merchant Management Controller
 *
 * PURPOSE: Handle admin operations for merchant verification and management
 * ENDPOINTS:
 * - GET /api/admin/merchants - List merchants with filters
 * - GET /api/admin/merchants/:userId - Get merchant details
 * - PUT /api/admin/merchants/:userId/verify - Approve merchant
 * - PUT /api/admin/merchants/:userId/reject - Reject merchant
 * - PUT /api/admin/merchants/:userId/suspend - Suspend merchant
 */

const baseController = new BaseController();

/**
 * Get list of merchants with filters
 * GET /api/admin/merchants?status=unverified&page=1&limit=20&search=elgato
 */
const handleGetMerchants = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  // Build query
  const query = { roles: "merchant" };

  // Filter by verification status or shop status
  if (status && status !== "all") {
    if (status === "pending") {
      // Pending = merchants without shop setup (no shopName or empty)
      query.$or = [
        { "merchantDetails.shopName": { $exists: false } },
        { "merchantDetails.shopName": null },
        { "merchantDetails.shopName": "" },
      ];
    } else if (status === "suspended") {
      // Suspended = shopStatus is suspended
      query["merchantDetails.shopStatus"] = "suspended";
    } else {
      // Other statuses filter by verificationStatus (verified, rejected, unverified)
      query["merchantDetails.verificationStatus"] = status;
    }
  }

  let merchants = [];
  let total = 0;

  // If search exists, use Fuse.js for fuzzy search (typo-tolerant)
  if (search && search.trim()) {
    // Get all merchants matching the status filter
    const allMerchants = await User.find(query)
      .select(
        "email profile.username profile.avatar " +
          "merchantDetails.shopName merchantDetails.shopSlug merchantDetails.shopStatus " +
          "merchantDetails.verificationStatus merchantDetails.isUiTMVerified " +
          "+merchantDetails.verificationEmail +merchantDetails.verificationDate " +
          "createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Configure Fuse.js for fuzzy search on shopName only
    const fuseOptions = {
      keys: ["merchantDetails.shopName"], // Search only in shop name
      threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
      distance: 100, // Max distance between characters
      ignoreLocation: true, // Don't care where in string match occurs
      includeScore: true,
      minMatchCharLength: 2,
    };

    const fuse = new Fuse(allMerchants, fuseOptions);
    const searchResults = fuse.search(search.trim());

    // Extract actual merchants from Fuse results
    const searchedMerchants = searchResults.map((result) => result.item);

    // Apply pagination to search results
    total = searchedMerchants.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    merchants = searchedMerchants.slice(skip, skip + parseInt(limit));
  } else {
    // No search: standard query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    [merchants, total] = await Promise.all([
      User.find(query)
        .select(
          "email profile.username profile.avatar " +
            "merchantDetails.shopName merchantDetails.shopSlug merchantDetails.shopStatus " +
            "merchantDetails.verificationStatus merchantDetails.isUiTMVerified " +
            "+merchantDetails.verificationEmail +merchantDetails.verificationDate " +
            "createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);
  }

  // Log action
  baseController.logAction("getMerchants", req, {
    filters: { status, search },
    resultCount: merchants.length,
  });

  return baseController.sendSuccess(res, {
    merchants,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1,
    },
  });
}, "get_merchants");

/**
 * Get single merchant details
 * GET /api/admin/merchants/:userId
 */
const handleGetMerchantDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const merchant = await User.findById(userId)
    .select(
      "email profile roles " +
        "merchantDetails.shopName merchantDetails.shopSlug merchantDetails.shopDescription " +
        "merchantDetails.shopLogo merchantDetails.shopBanner merchantDetails.businessEmail " +
        "merchantDetails.shopStatus merchantDetails.verificationStatus " +
        "merchantDetails.isUiTMVerified merchantDetails.permanentVerification " +
        "merchantDetails.shopRating merchantDetails.shopMetrics " +
        "+merchantDetails.verificationEmail +merchantDetails.verificationDate " +
        "createdAt updatedAt"
    )
    .lean();

  if (!merchant) {
    throw new AppError("Merchant not found", 404);
  }

  if (!merchant.roles.includes("merchant")) {
    throw new AppError("User is not a merchant", 400);
  }

  // Get additional stats
  const Listing = require("../../models/listing/listing.model");
  const { Order } = require("../../models/order");

  const [listingCount, orderCount] = await Promise.all([
    Listing.countDocuments({ "seller.userId": userId }),
    Order.countDocuments({
      "seller.userId": userId,
      status: "completed",
    }),
  ]);

  baseController.logAction("getMerchantDetails", req, { userId });

  return baseController.sendSuccess(res, {
    merchant: {
      ...merchant,
      stats: {
        totalListings: listingCount,
        completedOrders: orderCount,
      },
    },
  });
}, "get_merchant_details");

/**
 * Approve merchant verification
 * PUT /api/admin/merchants/:userId/verify
 */
const handleVerifyMerchant = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { note } = req.body;

  const merchant = await User.findById(userId);

  if (!merchant) {
    throw new AppError("Merchant not found", 404);
  }

  if (!merchant.roles.includes("merchant")) {
    throw new AppError("User is not a merchant", 400);
  }

  // Update verification status
  merchant.merchantDetails.verificationStatus = "verified";
  merchant.merchantDetails.shopStatus = "active";
  merchant.merchantDetails.verificationDate = new Date();

  await merchant.save();

  // Send notification email
  try {
    const emailService = require("../../services/email.service");
    await emailService.sendMerchantApprovalEmail(merchant, note);
  } catch (emailError) {
    logger.warn("Failed to send merchant approval email", {
      userId: userId.toString(),
      error: emailError.message,
    });
  }

  baseController.logAction("verifyMerchant", req, { userId, note });

  logger.info("Merchant verified by admin", {
    userId: userId.toString(),
    adminId: req.user._id.toString(),
    shopName: merchant.merchantDetails.shopName,
  });

  return baseController.sendSuccess(res, {
    message: "Merchant verified successfully",
    merchant: {
      _id: merchant._id,
      shopName: merchant.merchantDetails.shopName,
      verificationStatus: merchant.merchantDetails.verificationStatus,
      shopStatus: merchant.merchantDetails.shopStatus,
    },
  });
}, "verify_merchant");

/**
 * Reject merchant verification
 * PUT /api/admin/merchants/:userId/reject
 */
const handleRejectMerchant = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new AppError("Rejection reason is required", 400);
  }

  const merchant = await User.findById(userId);

  if (!merchant) {
    throw new AppError("Merchant not found", 404);
  }

  if (!merchant.roles.includes("merchant")) {
    throw new AppError("User is not a merchant", 400);
  }

  // Update verification status
  merchant.merchantDetails.verificationStatus = "rejected";
  merchant.merchantDetails.shopStatus = "suspended";

  await merchant.save();

  // Send notification email
  try {
    const emailService = require("../../services/email.service");
    await emailService.sendMerchantRejectionEmail(merchant, reason);
  } catch (emailError) {
    logger.warn("Failed to send merchant rejection email", {
      userId: userId.toString(),
      error: emailError.message,
    });
  }

  baseController.logAction("rejectMerchant", req, { userId, reason });

  logger.info("Merchant rejected by admin", {
    userId: userId.toString(),
    adminId: req.user._id.toString(),
    shopName: merchant.merchantDetails.shopName,
    reason,
  });

  return baseController.sendSuccess(res, {
    message: "Merchant rejected",
    merchant: {
      _id: merchant._id,
      shopName: merchant.merchantDetails.shopName,
      verificationStatus: merchant.merchantDetails.verificationStatus,
      shopStatus: merchant.merchantDetails.shopStatus,
    },
  });
}, "reject_merchant");

/**
 * Suspend merchant
 * PUT /api/admin/merchants/:userId/suspend
 */
const handleSuspendMerchant = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new AppError("Suspension reason is required", 400);
  }

  const merchant = await User.findById(userId);

  if (!merchant) {
    throw new AppError("Merchant not found", 404);
  }

  if (!merchant.roles.includes("merchant")) {
    throw new AppError("User is not a merchant", 400);
  }

  // Update shop status
  merchant.merchantDetails.shopStatus = "suspended";

  await merchant.save();

  // Send notification email
  try {
    const emailService = require("../../services/email.service");
    await emailService.sendMerchantSuspensionEmail(merchant, reason);
  } catch (emailError) {
    logger.warn("Failed to send merchant suspension email", {
      userId: userId.toString(),
      error: emailError.message,
    });
  }

  baseController.logAction("suspendMerchant", req, { userId, reason });

  logger.info("Merchant suspended by admin", {
    userId: userId.toString(),
    adminId: req.user._id.toString(),
    shopName: merchant.merchantDetails.shopName,
    reason,
  });

  return baseController.sendSuccess(res, {
    message: "Merchant suspended",
    merchant: {
      _id: merchant._id,
      shopName: merchant.merchantDetails.shopName,
      shopStatus: merchant.merchantDetails.shopStatus,
    },
  });
}, "suspend_merchant");

/**
 * Reactivate suspended merchant
 * PUT /api/admin/merchants/:userId/reactivate
 */
const handleReactivateMerchant = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const merchant = await User.findById(userId);

  if (!merchant) {
    throw new AppError("Merchant not found", 404);
  }

  if (!merchant.roles.includes("merchant")) {
    throw new AppError("User is not a merchant", 400);
  }

  // Check verification status - rejected merchants cannot be reactivated
  if (merchant.merchantDetails.verificationStatus === "rejected") {
    throw new AppError(
      "Cannot reactivate a rejected merchant. They must resubmit verification.",
      400,
      "MERCHANT_REJECTED"
    );
  }

  // Check if merchant needs verification setup
  if (merchant.merchantDetails.verificationStatus === "pending_setup") {
    throw new AppError(
      "Merchant has not completed verification setup yet",
      400,
      "PENDING_SETUP"
    );
  }

  // Update shop status
  merchant.merchantDetails.shopStatus = "active";

  await merchant.save();

  // Send notification email
  try {
    const emailService = require("../../services/email.service");
    await emailService.sendMerchantReactivationEmail(merchant);
  } catch (emailError) {
    logger.warn("Failed to send merchant reactivation email", {
      userId: userId.toString(),
      error: emailError.message,
    });
  }

  baseController.logAction("reactivateMerchant", req, { userId });

  logger.info("Merchant reactivated by admin", {
    userId: userId.toString(),
    adminId: req.user._id.toString(),
    shopName: merchant.merchantDetails.shopName,
  });

  return baseController.sendSuccess(res, {
    message: "Merchant reactivated",
    merchant: {
      _id: merchant._id,
      shopName: merchant.merchantDetails.shopName,
      shopStatus: merchant.merchantDetails.shopStatus,
    },
  });
}, "reactivate_merchant");

module.exports = {
  handleGetMerchants,
  handleGetMerchantDetails,
  handleVerifyMerchant,
  handleRejectMerchant,
  handleSuspendMerchant,
  handleReactivateMerchant,
};
