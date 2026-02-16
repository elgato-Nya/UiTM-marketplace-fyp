import api from "../../../services/api";

/**
 * Chat Service
 *
 * PURPOSE: Handle chat/messaging related API calls
 * SCOPE: Conversations CRUD, messages, read state, unread counts
 */

const chatService = {
  /**
   * Start or retrieve an existing conversation
   * @param {Object} data - { recipientId, listingId? }
   * @returns {Promise} { conversation, created }
   */
  async startConversation(data) {
    return api.post("/chat/conversations", data);
  },

  /**
   * Get paginated conversations for the current user (inbox)
   * @param {Object} params - { page, limit }
   * @returns {Promise} { conversations, pagination }
   */
  async getConversations(params = {}) {
    return api.get("/chat/conversations", { params });
  },

  /**
   * Get a single conversation by ID
   * @param {string} conversationId
   * @returns {Promise} { conversation }
   */
  async getConversation(conversationId) {
    return api.get(`/chat/conversations/${conversationId}`);
  },

  /**
   * Send a message in a conversation
   * @param {string} conversationId
   * @param {Object} data - { content, type?, imageUrl? }
   * @returns {Promise} { message }
   */
  async sendMessage(conversationId, data) {
    return api.post(
      `/chat/conversations/${conversationId}/messages`,
      data
    );
  },

  /**
   * Get paginated messages for a conversation
   * @param {string} conversationId
   * @param {Object} params - { page, limit }
   * @returns {Promise} { messages, pagination }
   */
  async getMessages(conversationId, params = {}) {
    return api.get(`/chat/conversations/${conversationId}/messages`, {
      params,
    });
  },

  /**
   * Mark all messages in a conversation as read
   * @param {string} conversationId
   * @returns {Promise} Success response
   */
  async markAsRead(conversationId) {
    return api.patch(`/chat/conversations/${conversationId}/read`);
  },

  /**
   * Soft-delete a conversation for the current user
   * @param {string} conversationId
   * @returns {Promise} Success response
   */
  async deleteConversation(conversationId) {
    return api.delete(`/chat/conversations/${conversationId}`);
  },

  /**
   * Get total unread chat message count across all conversations
   * @returns {Promise} { totalUnread }
   */
  async getUnreadCount() {
    return api.get("/chat/unread");
  },
};

export default chatService;
