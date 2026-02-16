const BaseController = require("../base.controller");
const chatService = require("../../services/chat/chat.service");
const { sanitizeObject, sanitizeQuery } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");

const baseController = new BaseController();

/**
 * Start or retrieve an existing conversation
 * @route POST /api/chat/conversations
 * @body  { recipientId, listingId? }
 */
const startConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { recipientId, listingId } = sanitizeObject(req.body);

  const { conversation, created } = await chatService.getOrCreateConversation(
    userId,
    recipientId,
    listingId || null
  );

  baseController.logAction("start_conversation", req, {
    userId: userId.toString(),
    recipientId,
    conversationId: conversation._id.toString(),
    created,
  });

  return baseController.sendSuccess(
    res,
    { conversation },
    created ? "Conversation created" : "Conversation retrieved",
    created ? 201 : 200
  );
}, "start_conversation");

/**
 * Get all conversations for the authenticated user (inbox)
 * @route GET /api/chat/conversations
 * @query page, limit
 */
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = sanitizeQuery(req.query);

  const result = await chatService.getUserConversations(userId, {
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), 50),
  });

  baseController.logAction("get_conversations", req, {
    userId: userId.toString(),
    count: result.conversations.length,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Conversations retrieved successfully"
  );
}, "get_conversations");

/**
 * Get a single conversation by ID
 * @route GET /api/chat/conversations/:conversationId
 */
const getConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  const conversation = await chatService.getConversationById(
    conversationId,
    userId
  );

  return baseController.sendSuccess(
    res,
    { conversation },
    "Conversation retrieved successfully"
  );
}, "get_conversation");

/**
 * Send a message in a conversation
 * @route POST /api/chat/conversations/:conversationId/messages
 * @body  { content, type?, imageUrl? }
 */
const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;
  const { content, type, imageUrl } = sanitizeObject(req.body);

  const message = await chatService.sendMessage(conversationId, userId, {
    content,
    type,
    imageUrl,
  });

  baseController.logAction("send_message", req, {
    userId: userId.toString(),
    conversationId,
    messageId: message._id.toString(),
  });

  return baseController.sendSuccess(
    res,
    { message },
    "Message sent successfully",
    201
  );
}, "send_message");

/**
 * Get messages for a conversation (paginated)
 * @route GET /api/chat/conversations/:conversationId/messages
 * @query page, limit
 */
const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = sanitizeQuery(req.query);

  const result = await chatService.getMessages(conversationId, userId, {
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), 100),
  });

  return baseController.sendSuccess(
    res,
    result,
    "Messages retrieved successfully"
  );
}, "get_messages");

/**
 * Mark all messages in a conversation as read
 * @route PATCH /api/chat/conversations/:conversationId/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  await chatService.markConversationAsRead(conversationId, userId);

  baseController.logAction("mark_conversation_read", req, {
    userId: userId.toString(),
    conversationId,
  });

  return baseController.sendSuccess(
    res,
    null,
    "Conversation marked as read"
  );
}, "mark_conversation_read");

/**
 * Soft-delete a conversation for the authenticated user
 * @route DELETE /api/chat/conversations/:conversationId
 */
const deleteConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  await chatService.deleteConversationForUser(conversationId, userId);

  baseController.logAction("delete_conversation", req, {
    userId: userId.toString(),
    conversationId,
  });

  return baseController.sendSuccess(
    res,
    null,
    "Conversation deleted"
  );
}, "delete_conversation");

/**
 * Get total unread chat count across all conversations
 * @route GET /api/chat/unread
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await chatService.getTotalUnreadCount(userId);

  return baseController.sendSuccess(
    res,
    result,
    "Unread count retrieved"
  );
}, "get_unread_count");

module.exports = {
  startConversation,
  getConversations,
  getConversation,
  sendMessage,
  getMessages,
  markAsRead,
  deleteConversation,
  getUnreadCount,
};
