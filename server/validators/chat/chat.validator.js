/**
 * Chat Validator
 *
 * PURPOSE: Pure validation logic for chat/messaging operations
 * PATTERN: Static class methods (same as WishlistValidator, CartValidator, etc.)
 */

const MESSAGE_MAX_LENGTH = 2000;
const ALLOWED_MESSAGE_TYPES = ["text", "image", "system"];

class ChatValidator {
  /**
   * Validate MongoDB ObjectId format
   * @param {string} id
   * @returns {boolean}
   */
  static isValidObjectId(id) {
    if (!id || typeof id !== "string") return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Validate message content
   * @param {string} content
   * @returns {boolean}
   */
  static isValidMessageContent(content) {
    if (!content || typeof content !== "string") return false;
    const trimmed = content.trim();
    return trimmed.length > 0 && trimmed.length <= MESSAGE_MAX_LENGTH;
  }

  /**
   * Validate message type
   * @param {string} type
   * @returns {boolean}
   */
  static isValidMessageType(type) {
    return ALLOWED_MESSAGE_TYPES.includes(type);
  }

  /**
   * Validate pagination page number
   * @param {number} page
   * @returns {boolean}
   */
  static isValidPage(page) {
    return Number.isInteger(page) && page >= 1;
  }

  /**
   * Validate pagination limit
   * @param {number} limit
   * @returns {boolean}
   */
  static isValidLimit(limit) {
    return Number.isInteger(limit) && limit >= 1 && limit <= 100;
  }
}

const chatErrorMessages = {
  recipientId: {
    required: "Recipient ID is required",
    invalid: "Invalid recipient ID format",
    self: "Cannot start a conversation with yourself",
  },
  conversationId: {
    required: "Conversation ID is required",
    invalid: "Invalid conversation ID format",
    notFound: "Conversation not found",
  },
  listingId: {
    invalid: "Invalid listing ID format",
  },
  content: {
    required: "Message content is required",
    tooLong: `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`,
  },
  type: {
    invalid: `Message type must be one of: ${ALLOWED_MESSAGE_TYPES.join(", ")}`,
  },
  pagination: {
    invalidPage: "Page must be a positive integer",
    invalidLimit: "Limit must be between 1 and 100",
  },
};

module.exports = {
  ChatValidator,
  chatErrorMessages,
  MESSAGE_MAX_LENGTH,
  ALLOWED_MESSAGE_TYPES,
};
