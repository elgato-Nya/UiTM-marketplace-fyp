const express = require("express");
const router = express.Router();
const contactController = require("../../controllers/contact/contact.controller");
const { protect, authorize } = require("../../middleware/auth/auth.middleware");
const { uploadMultiple } = require("../../middleware/upload.middleware");
const {
  validateCreateSubmission,
  validateContactId,
  validateStatusUpdate,
  validateAdminResponse,
  validateInternalNote,
  validateContactFilters,
} = require("../../middleware/validations/contact/contact.validation");

/**
 * Contact Routes
 *
 * PURPOSE: Handle contact form submissions and admin management
 * SCOPE: Bug reports, enquiries, feedback, collaboration requests
 * AUTHENTICATION: Mixed - public submissions, protected admin operations
 * AUTHORIZATION: Admin-only for management operations
 *
 * ROUTE STRUCTURE:
 * - /api/contact/submit (public submission endpoint)
 * - /api/contact (admin list view)
 * - /api/contact/:id (admin detail view and operations)
 * - /api/contact/stats (admin statistics)
 */

// ==================== PUBLIC ROUTES ====================

/**
 * @route   POST /api/contact/submit
 * @desc    Create new contact submission (bug report, enquiry, feedback, collaboration)
 * @access  Public (guest users) / Private (authenticated users get auto-filled info)
 * @body    type, name, email, phoneNumber, subject, message, bugDetails, collaborationDetails
 * @returns Created contact submission
 * @note    Guest users can submit, authenticated users get info pre-populated
 */
router.post(
  "/submit",
  validateCreateSubmission,
  contactController.createSubmission
);

/**
 * @route   POST /api/contact/upload-images
 * @desc    Upload images for bug reports or feedback (max 5 images)
 * @access  Public (guest users) / Private (authenticated users)
 * @body    images (multipart), type (bug/feedback)
 * @returns Uploaded image URLs and keys
 * @note    Only allowed for bug and feedback submission types
 */
router.post(
  "/upload-images",
  uploadMultiple,
  contactController.uploadContactImages
);

// ==================== ADMIN ROUTES ====================

// Apply authentication and authorization middleware to all routes below
router.use(protect);
router.use(authorize("admin"));

/**
 * @route   GET /api/contact/stats
 * @desc    Get contact submission statistics
 * @access  Private (Admin only)
 * @query   dateFrom, dateTo, type, status
 * @returns Contact statistics and analytics
 * @note    Must come before /:id route to avoid being caught as parameter
 */
router.get("/stats", contactController.getStatistics);

/**
 * @route   GET /api/contact
 * @desc    Get all contact submissions with filtering and pagination
 * @access  Private (Admin only)
 * @query   type, status, priority, assignedTo, search, dateFrom, dateTo, page, limit, sort
 * @returns Paginated contact submissions
 */
router.get("/", validateContactFilters, contactController.getAllContacts);

/**
 * @route   GET /api/contact/:id
 * @desc    Get contact submission by ID
 * @access  Private (Admin only)
 * @params  id - Contact submission ID
 * @query   includeReferences (populate user references)
 * @returns Contact submission details
 */
router.get("/:id", validateContactId, contactController.getContactById);

/**
 * @route   PATCH /api/contact/:id/status
 * @desc    Update contact submission status, priority, or assignment
 * @access  Private (Admin only)
 * @params  id - Contact submission ID
 * @body    status, priority, assignedTo
 * @returns Updated contact submission
 */
router.patch(
  "/:id/status",
  validateContactId,
  validateStatusUpdate,
  contactController.updateStatus
);

/**
 * @route   POST /api/contact/:id/response
 * @desc    Add admin response to contact submission
 * @access  Private (Admin only)
 * @params  id - Contact submission ID
 * @body    message - Response message
 * @returns Updated contact submission with response
 * @note    Auto-updates status to in-progress if pending
 */
router.post(
  "/:id/response",
  validateContactId,
  validateAdminResponse,
  contactController.addResponse
);

/**
 * @route   POST /api/contact/:id/note
 * @desc    Add internal note to contact submission
 * @access  Private (Admin only)
 * @params  id - Contact submission ID
 * @body    note - Internal note text
 * @returns Updated contact submission with note
 * @note    Internal notes are not visible to submitter
 */
router.post(
  "/:id/note",
  validateContactId,
  validateInternalNote,
  contactController.addNote
);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Close/delete contact submission (soft delete)
 * @access  Private (Admin only)
 * @params  id - Contact submission ID
 * @returns Closed contact submission
 * @note    Performs soft delete by marking as closed
 */
router.delete("/:id", validateContactId, contactController.deleteContact);

module.exports = router;
