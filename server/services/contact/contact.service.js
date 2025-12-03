const Contact = require("../../models/contact/contact.model");
const logger = require("../../utils/logger");
const { handleServiceError, handleNotFoundError } = require("../base.service");

/**
 * Contact Service
 *
 * PURPOSE: Handle contact form submissions and admin management
 * SCOPE: Bug reports, enquiries, feedback, collaboration requests
 * FEATURES:
 * - Guest and authenticated user submissions
 * - Status tracking and priority management
 * - Admin response system
 * - Statistics and analytics
 */

/**
 * Create new contact submission
 * @param {Object} submissionData - Contact form data
 * @param {Object} userInfo - User information (optional for guests)
 * @returns {Promise<Object>} Created contact submission
 */
const createContactSubmission = async (submissionData, userInfo = null) => {
  try {
    const contactData = {
      type: submissionData.type,
      subject: submissionData.subject,
      message: submissionData.message,
      submittedBy: {
        userId: userInfo?.userId || null,
        name: submissionData.name || userInfo?.name,
        email: submissionData.email || userInfo?.email,
        phoneNumber: submissionData.phoneNumber || userInfo?.phoneNumber,
        isGuest: !userInfo?.userId,
      },
      ipAddress: submissionData.ipAddress,
      userAgent: submissionData.userAgent,
      referralSource: submissionData.referralSource,
    };

    // Add type-specific details
    if (submissionData.type === "bug" && submissionData.bugDetails) {
      contactData.bugDetails = submissionData.bugDetails;
      // Auto-set priority based on bug severity
      if (submissionData.bugDetails.severity === "critical") {
        contactData.priority = "urgent";
      } else if (submissionData.bugDetails.severity === "high") {
        contactData.priority = "high";
      }
    }

    if (
      submissionData.type === "collaboration" &&
      submissionData.collaborationDetails
    ) {
      contactData.collaborationDetails = submissionData.collaborationDetails;
      contactData.priority = "high"; // Collaboration requests are typically high priority
    }

    if (submissionData.type === "feedback" && submissionData.feedbackDetails) {
      contactData.feedbackDetails = submissionData.feedbackDetails;
    }

    // Note: attachments and internalNotes are admin-only fields and should not be populated from client submissions

    const contact = await Contact.create(contactData);

    logger.info("Contact submission created", {
      contactId: contact._id,
      type: contact.type,
      submitterEmail: contact.submittedBy.email,
      isGuest: contact.submittedBy.isGuest,
    });

    // Return contact without admin-only fields
    return cleanContactForClient(contact);
  } catch (error) {
    return handleServiceError(error, "createContactSubmission");
  }
};

/**
 * Remove admin-only fields from contact object for client responses
 * @param {Object} contact - Contact document
 * @returns {Object} Cleaned contact object
 */
const cleanContactForClient = (contact) => {
  const contactObj = contact.toObject();

  // Remove admin-only fields
  delete contactObj.attachments;
  delete contactObj.internalNotes;
  delete contactObj.adminResponse;
  delete contactObj.assignedTo;
  delete contactObj.resolutionSummary;
  delete contactObj.resolvedAt;
  delete contactObj.responseTime; // Virtual field

  // Remove empty type-specific details that don't apply to this submission
  if (
    contactObj.type !== "bug" ||
    !contactObj.bugDetails ||
    Object.keys(contactObj.bugDetails).length === 0
  ) {
    delete contactObj.bugDetails;
  } else if (contactObj.bugDetails) {
    // Clean empty arrays in bugDetails
    if (
      contactObj.bugDetails.screenshots &&
      contactObj.bugDetails.screenshots.length === 0
    ) {
      delete contactObj.bugDetails.screenshots;
    }
    // Remove null/undefined severity if not set
    if (
      contactObj.bugDetails.severity === null ||
      contactObj.bugDetails.severity === undefined
    ) {
      delete contactObj.bugDetails.severity;
    }
  }

  if (
    contactObj.type !== "feedback" ||
    !contactObj.feedbackDetails ||
    Object.keys(contactObj.feedbackDetails).length === 0
  ) {
    delete contactObj.feedbackDetails;
  } else if (contactObj.feedbackDetails) {
    // Clean empty arrays in feedbackDetails
    if (
      contactObj.feedbackDetails.screenshots &&
      contactObj.feedbackDetails.screenshots.length === 0
    ) {
      delete contactObj.feedbackDetails.screenshots;
    }
    if (
      contactObj.feedbackDetails.rating === null ||
      contactObj.feedbackDetails.rating === undefined
    ) {
      delete contactObj.feedbackDetails.rating;
    }
  }

  if (
    contactObj.type !== "collaboration" ||
    !contactObj.collaborationDetails ||
    Object.keys(contactObj.collaborationDetails).length === 0
  ) {
    delete contactObj.collaborationDetails;
  }

  return contactObj;
};

/**
 * Get contact submission by ID
 * @param {string} contactId - Contact ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Contact submission details
 */
const getContactById = async (contactId, options = {}) => {
  try {
    let query = Contact.findById(contactId);

    // Populate references if needed
    if (options.includeReferences) {
      query = query
        .populate("submittedBy.userId", "profile.username email")
        .populate("adminResponse.respondedBy", "profile.username")
        .populate("assignedTo", "profile.username")
        .populate("internalNotes.addedBy", "profile.username");
    }

    const contact = await query.exec();

    if (!contact) {
      throw handleNotFoundError("Contact submission", contactId);
    }

    return contact;
  } catch (error) {
    return handleServiceError(error, "getContactById");
  }
};

/**
 * Get all contact submissions with filters and pagination
 * @param {Object} filters - Query filters
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated contact submissions
 */
const getAllContacts = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 20, sort = "-createdAt" } = pagination;
    const skip = (page - 1) * limit;

    // Build query filters
    const query = {};

    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.search) {
      query.$or = [
        { subject: { $regex: filters.search, $options: "i" } },
        { "submittedBy.email": { $regex: filters.search, $options: "i" } },
        { "submittedBy.name": { $regex: filters.search, $options: "i" } },
      ];
    }

    // Date range filters
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    const [contacts, totalItems] = await Promise.all([
      Contact.find(query)
        .populate("submittedBy.userId", "profile.username")
        .populate("adminResponse.respondedBy", "profile.username")
        .populate("assignedTo", "profile.username")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    return handleServiceError(error, "getAllContacts");
  }
};

/**
 * Update contact submission status
 * @param {string} contactId - Contact ID
 * @param {Object} updateData - Update data
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} Updated contact submission
 */
const updateContactStatus = async (contactId, updateData, adminId) => {
  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      throw handleNotFoundError("Contact submission", contactId);
    }

    // Update fields
    if (updateData.status) contact.status = updateData.status;
    if (updateData.priority) contact.priority = updateData.priority;
    if (updateData.assignedTo !== undefined)
      contact.assignedTo = updateData.assignedTo;

    await contact.save();

    logger.info("Contact submission status updated", {
      contactId: contact._id,
      status: contact.status,
      updatedBy: adminId,
    });

    return contact;
  } catch (error) {
    return handleServiceError(error, "updateContactStatus");
  }
};

/**
 * Add admin response to contact submission
 * @param {string} contactId - Contact ID
 * @param {Object} responseData - Response data
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} Updated contact submission
 */
const addAdminResponse = async (contactId, responseData, adminId) => {
  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      throw handleNotFoundError("Contact submission", contactId);
    }

    contact.adminResponse = {
      respondedBy: adminId,
      responseMessage: responseData.message,
      respondedAt: new Date(),
    };

    // Auto-update status if not already in progress
    if (contact.status === "pending") {
      contact.status = "in-progress";
    }

    await contact.save();

    logger.info("Admin response added to contact submission", {
      contactId: contact._id,
      respondedBy: adminId,
    });

    return contact;
  } catch (error) {
    return handleServiceError(error, "addAdminResponse");
  }
};

/**
 * Add internal note to contact submission
 * @param {string} contactId - Contact ID
 * @param {string} noteText - Note text
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} Updated contact submission
 */
const addInternalNote = async (contactId, noteText, adminId) => {
  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      throw handleNotFoundError("Contact submission", contactId);
    }

    contact.internalNotes.push({
      note: noteText,
      addedBy: adminId,
      addedAt: new Date(),
    });

    await contact.save();

    return contact;
  } catch (error) {
    return handleServiceError(error, "addInternalNote");
  }
};

/**
 * Get contact statistics
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Contact statistics
 */
const getContactStatistics = async (filters = {}) => {
  try {
    const stats = await Contact.getStatistics(filters);

    // Calculate additional metrics
    const activeSubmissions =
      (stats.pendingCount || 0) + (stats.inProgressCount || 0);
    const resolutionRate =
      stats.totalSubmissions > 0
        ? ((stats.resolvedCount + stats.closedCount) / stats.totalSubmissions) *
          100
        : 0;

    return {
      ...stats,
      activeSubmissions,
      resolutionRate: Math.round(resolutionRate * 100) / 100,
    };
  } catch (error) {
    return handleServiceError(error, "getContactStatistics");
  }
};

/**
 * Delete contact submission (soft delete by marking as closed)
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Updated contact submission
 */
const deleteContact = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      throw handleNotFoundError("Contact submission", contactId);
    }

    contact.status = "closed";
    contact.resolvedAt = new Date();
    contact.resolutionSummary = "Submission closed by admin";

    await contact.save();

    logger.info("Contact submission closed", {
      contactId: contact._id,
    });

    return contact;
  } catch (error) {
    return handleServiceError(error, "deleteContact");
  }
};

module.exports = {
  createContactSubmission,
  getContactById,
  getAllContacts,
  updateContactStatus,
  addAdminResponse,
  addInternalNote,
  getContactStatistics,
  deleteContact,
  cleanContactForClient,
};
