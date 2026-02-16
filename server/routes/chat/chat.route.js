const express = require("express");

const {
  startConversation,
  getConversations,
  getConversation,
  sendMessage,
  getMessages,
  markAsRead,
  deleteConversation,
  getUnreadCount,
} = require("../../controllers/chat");
const { protect } = require("../../middleware/auth/auth.middleware");
const {
  validateStartConversation,
  validateConversationIdParam,
  validateSendMessage,
  validateGetMessages,
  validateGetConversations,
} = require("../../middleware/validations/chat/chat.validation");
const { standardLimiter } = require("../../middleware/limiters.middleware");

/**
 * Chat Routes
 *
 * PURPOSE: Real-time messaging between users (buyer ↔ seller, any user pair)
 * SCOPE: Conversation management, message CRUD, read receipts
 * AUTHENTICATION: All routes require authentication
 * AUTHORIZATION: Users can only access conversations they participate in
 * RATE LIMITING: standardLimiter (100 requests per 15 minutes)
 *
 * ROUTE STRUCTURE:
 * - /api/chat/conversations            — list & create conversations
 * - /api/chat/conversations/:id         — single conversation ops
 * - /api/chat/conversations/:id/messages — message CRUD within a conversation
 * - /api/chat/conversations/:id/read    — mark-read
 * - /api/chat/unread                   — total unread badge count
 *
 * REAL-TIME:
 *   Message sending also emits via Socket.IO (handled inside the service layer).
 *   These REST endpoints serve as the primary API; the socket provides push.
 */

const router = express.Router();

// ==================== AUTHENTICATED ROUTES ====================

// All chat routes require auth + rate limiting
router.use(protect);
router.use(standardLimiter);

// ---------- Unread Count ----------

/**
 * @route   GET /api/chat/unread
 * @desc    Get total unread message count across all conversations
 * @access  Private
 * @returns { totalUnread: number }
 */
router.get("/unread", getUnreadCount);

// ---------- Conversations ----------

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all conversations for the authenticated user (inbox)
 * @access  Private
 * @query   page (default 1), limit (default 20)
 * @returns { conversations[], pagination }
 */
router.get("/conversations", validateGetConversations, getConversations);

/**
 * @route   POST /api/chat/conversations
 * @desc    Start a new conversation or retrieve existing one
 * @access  Private
 * @body    { recipientId: string, listingId?: string }
 * @returns { conversation, created: boolean }
 */
router.post("/conversations", validateStartConversation, startConversation);

/**
 * @route   GET /api/chat/conversations/:conversationId
 * @desc    Get a single conversation with participant details
 * @access  Private (participants only)
 * @returns { conversation }
 */
router.get(
  "/conversations/:conversationId",
  validateConversationIdParam,
  getConversation
);

/**
 * @route   DELETE /api/chat/conversations/:conversationId
 * @desc    Soft-delete a conversation for the authenticated user
 * @access  Private (participants only)
 */
router.delete(
  "/conversations/:conversationId",
  validateConversationIdParam,
  deleteConversation
);

// ---------- Messages ----------

/**
 * @route   GET /api/chat/conversations/:conversationId/messages
 * @desc    Get paginated messages for a conversation
 * @access  Private (participants only)
 * @query   page (default 1), limit (default 50)
 * @returns { messages[], pagination }
 */
router.get(
  "/conversations/:conversationId/messages",
  validateGetMessages,
  getMessages
);

/**
 * @route   POST /api/chat/conversations/:conversationId/messages
 * @desc    Send a message in a conversation
 * @access  Private (participants only)
 * @body    { content: string, type?: 'text'|'image', imageUrl?: string }
 * @returns { message }
 */
router.post(
  "/conversations/:conversationId/messages",
  validateSendMessage,
  sendMessage
);

// ---------- Read Receipts ----------

/**
 * @route   PATCH /api/chat/conversations/:conversationId/read
 * @desc    Mark all messages in a conversation as read
 * @access  Private (participants only)
 */
router.patch(
  "/conversations/:conversationId/read",
  validateConversationIdParam,
  markAsRead
);

module.exports = router;
