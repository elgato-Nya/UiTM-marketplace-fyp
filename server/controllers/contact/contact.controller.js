const BaseController = require("../base.controller");
const {
  createContactSubmission,
  getContactById: getContactByIdService,
  getAllContacts: getAllContactsService,
  updateContactStatus,
  addAdminResponse,
  addInternalNote,
  getContactStatistics,
  deleteContact: deleteContactService,
  getReportsByEntity,
  takeReportAction,
} = require("../../services/contact/contact.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sanitizeObject, sanitizeQuery } = require("../../utils/sanitizer");
const s3Service = require("../../services/upload/s3.service");
const imageService = require("../../services/upload/image.service");
const { s3Config } = require("../../config/s3.config");
const { createValidationError, AppError } = require("../../utils/errors");
const logger = require("../../utils/logger");

/**
 * Contact Controller
 *
 * PURPOSE: Handle contact form HTTP requests
 * SCOPE: Public submissions, admin management, content moderation reports
 * FEATURES:
 * - Guest and authenticated submissions
 * - Admin CRUD operations
 * - Status and response management
 * - Statistics retrieval
 * - Content report submissions and management
 */

const baseController = new BaseController();

/**
 * Create new contact submission
 * POST /api/contact/submit
 * @access Public (guest users) / Private (authenticated users)
 */
const createSubmission = asyncHandler(async (req, res) => {
  const sanitizedData = sanitizeObject(req.body);

  // Get user info if authenticated
  const userInfo = req.user
    ? {
        userId: req.user._id,
        name: req.user.profile?.username,
        email: req.user.email,
        phoneNumber: req.user.profile?.phoneNumber,
      }
    : null;

  // Add request metadata
  sanitizedData.ipAddress = req.ip || req.connection.remoteAddress;
  sanitizedData.userAgent = req.headers["user-agent"];
  sanitizedData.referralSource = req.headers.referer || req.headers.referrer;

  const contact = await createContactSubmission(sanitizedData, userInfo);

  baseController.logAction("create_contact_submission", req, {
    contactId: contact._id,
    type: contact.type,
    isGuest: contact.submittedBy.isGuest,
  });

  return baseController.sendSuccess(
    res,
    { contact },
    "Your submission has been received. We'll get back to you soon!",
    201
  );
}, "create_contact_submission");

/**
 * Get contact submission by ID
 * GET /api/contact/:id
 * @access Private (Admin only)
 */
const getContactById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { includeReferences } = sanitizeQuery(req.query);

  const options = {
    includeReferences: includeReferences === "true",
  };

  const contact = await getContactByIdService(id, options);

  return baseController.sendSuccess(
    res,
    { contact },
    "Contact submission retrieved successfully"
  );
}, "get_contact");

/**
 * Get all contact submissions
 * GET /api/contact
 * @access Private (Admin only)
 */
const getAllContacts = asyncHandler(async (req, res) => {
  const {
    type,
    status,
    priority,
    assignedTo,
    search,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = sanitizeQuery(req.query);

  const filters = {
    ...(type && { type }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assignedTo && { assignedTo }),
    ...(search && { search }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
  };

  const result = await getAllContactsService(filters, pagination);

  return baseController.sendSuccess(
    res,
    result,
    "Contact submissions retrieved successfully"
  );
}, "get_all_contacts");

/**
 * Update contact submission status
 * PATCH /api/contact/:id/status
 * @access Private (Admin only)
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;
  const sanitizedData = sanitizeObject(req.body);

  const contact = await updateContactStatus(id, sanitizedData, adminId);

  baseController.logAction("update_contact_status", req, {
    contactId: contact._id,
    newStatus: contact.status,
    updatedBy: adminId,
  });

  return baseController.sendSuccess(
    res,
    { contact },
    "Contact status updated successfully"
  );
}, "update_contact_status");

/**
 * Add admin response to contact submission
 * POST /api/contact/:id/response
 * @access Private (Admin only)
 */
const addResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;
  const sanitizedData = sanitizeObject(req.body);

  const contact = await addAdminResponse(id, sanitizedData, adminId);

  baseController.logAction("add_contact_response", req, {
    contactId: contact._id,
    respondedBy: adminId,
  });

  return baseController.sendSuccess(
    res,
    { contact },
    "Response added successfully"
  );
}, "add_contact_response");

/**
 * Add internal note to contact submission
 * POST /api/contact/:id/note
 * @access Private (Admin only)
 */
const addNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;
  const { note } = sanitizeObject(req.body);

  const contact = await addInternalNote(id, note, adminId);

  return baseController.sendSuccess(
    res,
    { contact },
    "Internal note added successfully"
  );
}, "add_internal_note");

/**
 * Get contact statistics
 * GET /api/contact/stats
 * @access Private (Admin only)
 */
const getStatistics = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, type, status } = sanitizeQuery(req.query);

  const filters = {
    ...(dateFrom && { createdAt: { $gte: new Date(dateFrom) } }),
    ...(dateTo && {
      createdAt: { ...filters?.createdAt, $lte: new Date(dateTo) },
    }),
    ...(type && { type }),
    ...(status && { status }),
  };

  const stats = await getContactStatistics(filters);

  return baseController.sendSuccess(
    res,
    { statistics: stats },
    "Contact statistics retrieved successfully"
  );
}, "get_contact_statistics");

/**
 * Delete/close contact submission
 * DELETE /api/contact/:id
 * @access Private (Admin only)
 */
const deleteContactSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;

  const contact = await deleteContactService(id);

  baseController.logAction("delete_contact", req, {
    contactId: contact._id,
    deletedBy: adminId,
  });

  return baseController.sendSuccess(
    res,
    { contact },
    "Contact submission closed successfully"
  );
}, "delete_contact");

/**
 * Upload images for bug reports or feedback
 * POST /api/contact/upload-images
 * @access Public (guest users) / Private (authenticated users)
 */
const uploadContactImages = asyncHandler(async (req, res) => {
  // Check if files exist
  if (!req.files || req.files.length === 0) {
    throw createValidationError("No images uploaded", {}, "NO_FILES_UPLOADED");
  }

  // Maximum 5 images per submission
  if (req.files.length > 5) {
    throw createValidationError(
      "Maximum 5 images allowed per submission",
      {},
      "TOO_MANY_FILES"
    );
  }

  const { type } = req.body;

  // Validate submission type allows images
  if (!["bug", "feedback"].includes(type)) {
    throw createValidationError(
      "Image uploads are only allowed for bug reports and feedback",
      { type },
      "INVALID_UPLOAD_TYPE"
    );
  }

  baseController.logAction("UPLOAD_CONTACT_IMAGES", req, {
    fileCount: req.files.length,
    type,
    totalSize: req.files.reduce((sum, file) => sum + file.size, 0),
  });

  logger.info("Uploading contact images to S3", {
    folder: "contact",
    subfolder: type,
    fileCount: req.files.length,
  });

  // Process and upload each image
  const uploadedImages = [];
  for (const file of req.files) {
    try {
      // Validate image
      const validation = await imageService.validateImage(file.buffer);
      if (!validation.valid) {
        throw validation.error;
      }

      // Optimize image
      const optimized = await imageService.optimizeImage(file.buffer, {
        format: "jpeg",
        quality: s3Config.imageQuality,
        maxWidth: 1920, // Contact images don't need to be huge
        maxHeight: 1920,
      });

      // Upload to S3 in contact/bug or contact/feedback folder
      const result = await s3Service.uploadFile(
        optimized.buffer,
        file.originalname,
        "image/jpeg",
        s3Config.folders.contact || "contact",
        type // bug or feedback
      );

      uploadedImages.push({
        url: result.url,
        key: result.key,
        filename: file.originalname,
        fileSize: result.size,
        originalSize: optimized.metadata.originalSize,
        savings: optimized.metadata.reductionPercent,
      });

      logger.info("Contact image uploaded successfully", {
        url: result.url,
        filename: file.originalname,
        savings: optimized.metadata.reductionPercent,
      });
    } catch (error) {
      logger.error(`Failed to upload image: ${file.originalname}`, error);
      // Continue with other images even if one fails
    }
  }

  if (uploadedImages.length === 0) {
    throw createValidationError(
      "Failed to upload any images",
      {},
      "UPLOAD_FAILED"
    );
  }

  baseController.logAction("UPLOAD_CONTACT_IMAGES_SUCCESS", req, {
    uploadedCount: uploadedImages.length,
    totalSize: uploadedImages.reduce((sum, img) => sum + img.fileSize, 0),
  });

  baseController.sendSuccess(
    res,
    {
      images: uploadedImages.map((img) => ({
        url: img.url,
        key: img.key,
        filename: img.filename,
        fileSize: img.fileSize,
      })),
      uploadedCount: uploadedImages.length,
    },
    "Images uploaded successfully",
    200
  );
});

/**
 * Get reports by entity (for content moderation)
 * GET /api/contact/reports/entity/:entityType/:entityId
 * @access Private (Admin only)
 */
const getEntityReports = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;

  const reports = await getReportsByEntity(entityType, entityId);

  return baseController.sendSuccess(
    res,
    { reports, count: reports.length },
    "Entity reports retrieved successfully"
  );
}, "get_entity_reports");

/**
 * Take action on content report
 * POST /api/contact/:id/action
 * @access Private (Admin only)
 */
const takeAction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;
  const { actionTaken } = sanitizeObject(req.body);

  if (!actionTaken) {
    throw new AppError("Action taken is required", 400);
  }

  const validActions = [
    "content_removed",
    "user_warned",
    "user_suspended",
    "listing_removed",
    "shop_suspended",
    "no_action",
  ];

  if (!validActions.includes(actionTaken)) {
    throw new AppError(
      `Invalid action. Must be one of: ${validActions.join(", ")}`,
      400
    );
  }

  const contact = await takeReportAction(id, actionTaken, adminId);

  baseController.logAction("take_report_action", req, {
    contactId: contact._id,
    actionTaken,
    adminId,
  });

  return baseController.sendSuccess(
    res,
    { contact },
    `Action taken: ${actionTaken.replace(/_/g, " ")}`
  );
}, "take_report_action");

module.exports = {
  createSubmission,
  getContactById,
  getAllContacts: getAllContacts,
  updateStatus,
  addResponse,
  addNote,
  getStatistics,
  deleteContact: deleteContactSubmission,
  uploadContactImages,
  getEntityReports,
  takeAction,
};
