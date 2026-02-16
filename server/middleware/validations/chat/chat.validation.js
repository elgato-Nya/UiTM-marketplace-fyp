const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../validation.error");
const {
  chatErrorMessages,
  MESSAGE_MAX_LENGTH,
  ALLOWED_MESSAGE_TYPES,
} = require("../../../validators/chat/chat.validator");

// ================ REUSABLE VALIDATION RULE CHAINS ================

/**
 * Validate recipientId in request body
 */
const recipientIdValidation = () => {
  return body("recipientId")
    .notEmpty()
    .withMessage(chatErrorMessages.recipientId.required)
    .bail()
    .trim()
    .isMongoId()
    .withMessage(chatErrorMessages.recipientId.invalid);
};

/**
 * Validate conversationId in URL params
 */
const conversationIdParamValidation = () => {
  return param("conversationId")
    .notEmpty()
    .withMessage(chatErrorMessages.conversationId.required)
    .bail()
    .trim()
    .isMongoId()
    .withMessage(chatErrorMessages.conversationId.invalid);
};

/**
 * Validate optional listingId in request body
 */
const listingIdBodyValidation = () => {
  return body("listingId")
    .optional({ values: "null" })
    .trim()
    .isMongoId()
    .withMessage(chatErrorMessages.listingId.invalid);
};

/**
 * Validate message content in request body
 */
const messageContentValidation = () => {
  return body("content")
    .notEmpty()
    .withMessage(chatErrorMessages.content.required)
    .bail()
    .trim()
    .isLength({ min: 1, max: MESSAGE_MAX_LENGTH })
    .withMessage(chatErrorMessages.content.tooLong);
};

/**
 * Validate optional message type in request body
 */
const messageTypeValidation = () => {
  return body("type")
    .optional()
    .isIn(ALLOWED_MESSAGE_TYPES)
    .withMessage(chatErrorMessages.type.invalid);
};

/**
 * Validate pagination query params
 */
const paginationValidation = () => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage(chatErrorMessages.pagination.invalidPage)
      .toInt(),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage(chatErrorMessages.pagination.invalidLimit)
      .toInt(),
  ];
};

// ================ COMPOSED VALIDATION MIDDLEWARES ================

/**
 * Validate Start / Get Conversation Request
 * @route POST /api/chat/conversations
 * @body  { recipientId, listingId? }
 */
const validateStartConversation = [
  recipientIdValidation(),
  listingIdBodyValidation(),
  handleValidationErrors,
];

/**
 * Validate Conversation ID param
 * @route GET /api/chat/conversations/:conversationId
 */
const validateConversationIdParam = [
  conversationIdParamValidation(),
  handleValidationErrors,
];

/**
 * Validate Send Message Request
 * @route POST /api/chat/conversations/:conversationId/messages
 * @body  { content, type? }
 */
const validateSendMessage = [
  conversationIdParamValidation(),
  messageContentValidation(),
  messageTypeValidation(),
  handleValidationErrors,
];

/**
 * Validate Get Messages Request (with pagination)
 * @route GET /api/chat/conversations/:conversationId/messages
 */
const validateGetMessages = [
  conversationIdParamValidation(),
  ...paginationValidation(),
  handleValidationErrors,
];

/**
 * Validate Get Conversations list (with pagination)
 * @route GET /api/chat/conversations
 */
const validateGetConversations = [
  ...paginationValidation(),
  handleValidationErrors,
];

module.exports = {
  validateStartConversation,
  validateConversationIdParam,
  validateSendMessage,
  validateGetMessages,
  validateGetConversations,
};
