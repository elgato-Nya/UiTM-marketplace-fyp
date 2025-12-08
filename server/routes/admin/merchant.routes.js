const express = require("express");
const router = express.Router();
const {
  handleGetMerchants,
  handleGetMerchantDetails,
  handleVerifyMerchant,
  handleRejectMerchant,
  handleSuspendMerchant,
  handleReactivateMerchant,
} = require("../../controllers/admin/merchant.controller");
const { protect, authorize } = require("../../middleware/auth/auth.middleware");

/**
 * Admin Merchant Management Routes
 *
 * BASE: /api/admin/merchants
 * AUTH: Admin only
 */

// Apply authentication and admin restriction to all routes
router.use(protect);
router.use(authorize(["admin"]));

/**
 * @route   GET /api/admin/merchants
 * @desc    Get list of merchants with filters
 * @query   status - Filter by verification status (unverified/pending/verified/rejected/all)
 * @query   search - Search by shop name, username, or email
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 20)
 * @access  Admin only
 */
router.get("/", handleGetMerchants);

/**
 * @route   GET /api/admin/merchants/:userId
 * @desc    Get single merchant details
 * @access  Admin only
 */
router.get("/:userId", handleGetMerchantDetails);

/**
 * @route   PUT /api/admin/merchants/:userId/verify
 * @desc    Approve merchant verification
 * @body    note - Optional approval note
 * @access  Admin only
 */
router.put("/:userId/verify", handleVerifyMerchant);

/**
 * @route   PUT /api/admin/merchants/:userId/reject
 * @desc    Reject merchant verification
 * @body    reason - Rejection reason (required)
 * @access  Admin only
 */
router.put("/:userId/reject", handleRejectMerchant);

/**
 * @route   PUT /api/admin/merchants/:userId/suspend
 * @desc    Suspend merchant
 * @body    reason - Suspension reason (required)
 * @access  Admin only
 */
router.put("/:userId/suspend", handleSuspendMerchant);

/**
 * @route   PUT /api/admin/merchants/:userId/reactivate
 * @desc    Reactivate suspended merchant
 * @access  Admin only
 */
router.put("/:userId/reactivate", handleReactivateMerchant);

module.exports = router;
