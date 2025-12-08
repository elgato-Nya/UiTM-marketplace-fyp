import api from "../api";

/**
 * Admin Contact Management Service
 *
 * PURPOSE: Handle API calls for contact submissions and content reports
 * ENDPOINTS: /api/contact/* (admin operations)
 * SCOPE: Bug reports, enquiries, feedback, collaboration requests, content moderation
 */

const BASE_URL = "/contact";

/**
 * Get list of contact submissions with filters and pagination
 * @param {Object} params - Query parameters
 * @param {string} params.type - Filter by type (bug/enquiry/feedback/collaboration/content_report/other)
 * @param {string} params.status - Filter by status (pending/in-progress/resolved/closed/spam)
 * @param {string} params.priority - Filter by priority (low/normal/high/urgent)
 * @param {string} params.category - Filter by report category (spam/fraud/harassment/etc) - for content_report only
 * @param {string} params.entityType - Filter by reported entity type (listing/user/shop) - for content_report only
 * @param {string} params.search - Search term (name, email, subject)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.sortBy - Sort field (createdAt/priority/status)
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @returns {Promise<Object>} Contact submissions with pagination
 */
export const getAllContacts = async (params = {}) => {
  const {
    type = "",
    status = "",
    priority = "",
    category = "",
    entityType = "",
    search = "",
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  // Add optional filters
  if (type) {
    queryParams.append("type", type);
  }
  if (status) {
    queryParams.append("status", status);
  }
  if (priority) {
    queryParams.append("priority", priority);
  }
  if (category) {
    queryParams.append("category", category);
  }
  if (entityType) {
    queryParams.append("entityType", entityType);
  }
  if (search) {
    queryParams.append("search", search);
  }

  const response = await api.get(`${BASE_URL}?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get contact statistics for dashboard
 * @returns {Promise<Object>} Contact statistics (total, by type, by status, by priority)
 */
export const getContactStats = async () => {
  const response = await api.get(`${BASE_URL}/stats`);
  return response.data;
};

/**
 * Get single contact submission details
 * @param {string} contactId - Contact submission ID
 * @returns {Promise<Object>} Contact submission details with history
 */
export const getContactById = async (contactId) => {
  const response = await api.get(`${BASE_URL}/${contactId}`);
  return response.data;
};

/**
 * Get all reports for a specific entity (listing/user/shop)
 * @param {string} entityType - Entity type (listing/user/shop)
 * @param {string} entityId - Entity ID
 * @returns {Promise<Object>} Reports for the entity
 */
export const getEntityReports = async (entityType, entityId) => {
  const response = await api.get(
    `${BASE_URL}/reports/entity/${entityType}/${entityId}`
  );
  return response.data;
};

/**
 * Update contact submission status
 * @param {string} contactId - Contact submission ID
 * @param {string} status - New status (pending/in-progress/resolved/closed/spam)
 * @returns {Promise<Object>} Updated contact submission
 */
export const updateContactStatus = async (contactId, status) => {
  const response = await api.patch(`${BASE_URL}/${contactId}/status`, {
    status,
  });
  return response.data;
};

/**
 * Add admin response to contact submission
 * @param {string} contactId - Contact submission ID
 * @param {string} response - Admin response message
 * @returns {Promise<Object>} Updated contact submission
 */
export const addAdminResponse = async (contactId, response) => {
  const responseData = await api.post(`${BASE_URL}/${contactId}/response`, {
    response,
  });
  return responseData.data;
};

/**
 * Add internal note to contact submission
 * @param {string} contactId - Contact submission ID
 * @param {string} note - Internal note (not visible to submitter)
 * @returns {Promise<Object>} Updated contact submission
 */
export const addInternalNote = async (contactId, note) => {
  const response = await api.post(`${BASE_URL}/${contactId}/note`, { note });
  return response.data;
};

/**
 * Take action on content report
 * @param {string} contactId - Contact/Report submission ID
 * @param {string} actionTaken - Action taken (content_removed/user_warned/user_suspended/user_banned/listing_removed/no_action)
 * @returns {Promise<Object>} Updated contact submission with action
 */
export const takeReportAction = async (contactId, actionTaken) => {
  const response = await api.post(`${BASE_URL}/${contactId}/action`, {
    actionTaken,
  });
  return response.data;
};

/**
 * Delete (soft delete) contact submission
 * @param {string} contactId - Contact submission ID
 * @returns {Promise<Object>} Deleted contact submission
 */
export const deleteContact = async (contactId) => {
  const response = await api.delete(`${BASE_URL}/${contactId}`);
  return response.data;
};

/**
 * Submit new contact form (public endpoint)
 * @param {Object} formData - Contact form data
 * @param {string} formData.type - Submission type
 * @param {string} formData.name - Submitter name
 * @param {string} formData.email - Submitter email
 * @param {string} formData.subject - Subject line
 * @param {string} formData.message - Message content
 * @param {Object} formData.bugDetails - Bug-specific fields (optional)
 * @param {Object} formData.collaborationDetails - Collaboration-specific fields (optional)
 * @param {Object} formData.contentReport - Content report fields (optional)
 * @returns {Promise<Object>} Created contact submission
 */
export const submitContactForm = async (formData) => {
  const response = await api.post(`${BASE_URL}/submit`, formData);
  return response.data;
};

/**
 * Upload images for bug reports or feedback
 * @param {FormData} formData - FormData with images
 * @returns {Promise<Object>} Uploaded image URLs
 */
export const uploadContactImages = async (formData) => {
  const response = await api.post(`${BASE_URL}/upload-images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const contactService = {
  getAllContacts,
  getContactStats,
  getContactById,
  getEntityReports,
  updateContactStatus,
  addAdminResponse,
  addInternalNote,
  takeReportAction,
  deleteContact,
  submitContactForm,
  uploadContactImages,
};

export default contactService;
