const express = require("express");

const {
  handleCreateQuote,
  handleGetQuote,
  handleGetMyQuotes,
  handleGetSellerQuotes,
  handleProvideQuote,
  handleAcceptQuote,
  handleRejectQuote,
  handleCancelQuote,
  handleStartService,
  handleCompleteService,
  handleGetQuotesByListing,
} = require("../../controllers/quote/quote.controller");
const { protect, authorize } = require("../../middleware/auth/auth.middleware");
const {
  validateCreateQuote,
  validateQuoteIdParam,
  validateListingIdParam,
  validateProvideQuote,
  validateAcceptQuote,
  validateRejectQuote,
  validateCancelQuote,
  validateStartService,
  validateCompleteService,
  validateGetQuotes,
  validateGetQuote,
} = require("../../middleware/validations/quote/quote.validation");
const { standardLimiter } = require("../../middleware/limiters.middleware");

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(protect);
router.use(standardLimiter);

// ==================== BUYER ROUTES ====================

/**
 * @route   POST /api/quotes
 * @desc    Create a new quote request for a service listing
 * @access  Private (All authenticated users)
 * @body    listingId, message, budget?, timeline?, priority?, customFieldValues?
 * @returns Created quote request
 */
router.post("/", validateCreateQuote, handleCreateQuote);

/**
 * @route   GET /api/quotes/my-quotes
 * @desc    Get current user's quote requests (as buyer or seller)
 * @access  Private
 * @query   role (buyer|seller), page, limit, sort, status
 * @returns Paginated quotes based on role perspective
 */
router.get("/my-quotes", validateGetQuotes, handleGetMyQuotes);

/**
 * @route   PATCH /api/quotes/:id/accept
 * @desc    Accept a quote provided by seller
 * @access  Private (Buyer only)
 * @params  id - Quote ID
 * @returns Updated quote with accepted status
 */
router.patch("/:id/accept", validateAcceptQuote, handleAcceptQuote);

/**
 * @route   PATCH /api/quotes/:id/reject
 * @desc    Reject a quote provided by seller
 * @access  Private (Buyer only)
 * @params  id - Quote ID
 * @body    reason?
 * @returns Updated quote with rejected status
 */
router.patch("/:id/reject", validateRejectQuote, handleRejectQuote);

// ==================== SELLER ROUTES ====================

/**
 * @route   GET /api/quotes/seller
 * @desc    Get quote requests received by seller
 * @access  Private (Merchants and Admins)
 * @query   page, limit, sort, status, priority
 * @returns Paginated quote requests with stats
 */
router.get(
  "/seller",
  authorize("merchant", "admin"),
  validateGetQuotes,
  handleGetSellerQuotes,
);

/**
 * @route   GET /api/quotes/listing/:listingId
 * @desc    Get quote requests for a specific listing
 * @access  Private (Listing owner and Admins)
 * @params  listingId - Listing ID
 * @query   page, limit, status
 * @returns Paginated quote requests for listing
 */
router.get(
  "/listing/:listingId",
  authorize("merchant", "admin"),
  validateListingIdParam,
  validateGetQuotes,
  handleGetQuotesByListing,
);

/**
 * @route   PATCH /api/quotes/:id/respond
 * @desc    Provide quote response to buyer request
 * @access  Private (Seller only)
 * @params  id - Quote ID
 * @body    quotedPrice, estimatedDuration?, message?, depositRequired?, depositAmount?, terms?
 * @returns Updated quote with seller's response
 */
router.patch(
  "/:id/respond",
  authorize("merchant", "admin"),
  validateProvideQuote,
  handleProvideQuote,
);

/**
 * @route   PATCH /api/quotes/:id/start
 * @desc    Mark service as started
 * @access  Private (Seller only)
 * @params  id - Quote ID
 * @returns Updated quote with in_progress status
 */
router.patch(
  "/:id/start",
  authorize("merchant", "admin"),
  validateStartService,
  handleStartService,
);

/**
 * @route   PATCH /api/quotes/:id/complete
 * @desc    Mark service as completed
 * @access  Private (Seller only)
 * @params  id - Quote ID
 * @body    completionNote?
 * @returns Updated quote with completed status
 */
router.patch(
  "/:id/complete",
  authorize("merchant", "admin"),
  validateCompleteService,
  handleCompleteService,
);

// ==================== SHARED ROUTES ====================

/**
 * @route   GET /api/quotes/:id
 * @desc    Get quote details by ID
 * @access  Private (Quote participants and Admins)
 * @params  id - Quote ID
 * @returns Quote details with user perspective
 */
router.get("/:id", validateGetQuote, handleGetQuote);

/**
 * @route   PATCH /api/quotes/:id/cancel
 * @desc    Cancel a quote request
 * @access  Private (Quote participants)
 * @params  id - Quote ID
 * @body    reason, note?
 * @returns Cancelled quote confirmation
 */
router.patch("/:id/cancel", validateCancelQuote, handleCancelQuote);

module.exports = router;
