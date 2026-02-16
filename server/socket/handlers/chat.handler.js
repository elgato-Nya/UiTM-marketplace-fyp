const logger = require("../../utils/logger");
const chatService = require("../../services/chat/chat.service");

/**
 * Chat Socket Handlers
 *
 * PURPOSE: Register real-time chat events on an authenticated socket
 * EVENTS HANDLED:
 *   chat:join        — Join a conversation room for live message streaming
 *   chat:leave       — Leave a conversation room
 *   chat:typing      — Broadcast typing indicator to the other participant
 *   chat:stop_typing — Clear typing indicator
 *   chat:send        — Send a message via socket (alternative to REST POST)
 *   chat:read        — Mark conversation as read via socket
 *
 * DESIGN: All mutation events (send, read) delegate to the same service layer
 *         used by the REST controllers, keeping business logic in one place.
 */

const registerChatHandlers = (socket) => {
  const { userId, userName } = socket;

  /**
   * Join a conversation room to receive live messages
   * Client emits: socket.emit('chat:join', { conversationId })
   */
  socket.on("chat:join", async ({ conversationId }) => {
    try {
      if (!conversationId) return;

      // Verify the user is actually a participant
      const conversation = await chatService.getConversationById(
        conversationId,
        userId
      );
      if (!conversation) return;

      const roomName = `conversation:${conversationId}`;
      socket.join(roomName);

      logger.debug("User joined conversation room", {
        userId,
        conversationId,
        socketId: socket.id,
      });
    } catch (err) {
      logger.debug("Failed to join conversation room", {
        userId,
        conversationId,
        error: err.message,
      });
    }
  });

  /**
   * Leave a conversation room
   * Client emits: socket.emit('chat:leave', { conversationId })
   */
  socket.on("chat:leave", ({ conversationId }) => {
    if (!conversationId) return;
    const roomName = `conversation:${conversationId}`;
    socket.leave(roomName);

    logger.debug("User left conversation room", {
      userId,
      conversationId,
      socketId: socket.id,
    });
  });

  /**
   * Typing indicator — broadcast to the conversation room
   * Client emits: socket.emit('chat:typing', { conversationId })
   */
  socket.on("chat:typing", ({ conversationId }) => {
    if (!conversationId) return;
    const roomName = `conversation:${conversationId}`;
    socket.to(roomName).emit("chat:typing", {
      conversationId,
      userId,
      userName,
    });
  });

  /**
   * Stop typing indicator
   * Client emits: socket.emit('chat:stop_typing', { conversationId })
   */
  socket.on("chat:stop_typing", ({ conversationId }) => {
    if (!conversationId) return;
    const roomName = `conversation:${conversationId}`;
    socket.to(roomName).emit("chat:stop_typing", {
      conversationId,
      userId,
    });
  });

  /**
   * Send a message via socket (real-time alternative to REST POST)
   * Client emits: socket.emit('chat:send', { conversationId, content, type? })
   * Server responds: socket.emit('chat:message_sent', { message }) on success
   *                  socket.emit('chat:error', { message }) on failure
   */
  socket.on("chat:send", async ({ conversationId, content, type, imageUrl }) => {
    try {
      if (!conversationId || !content) {
        socket.emit("chat:error", {
          message: "conversationId and content are required",
        });
        return;
      }

      const message = await chatService.sendMessage(conversationId, userId, {
        content: content.substring(0, 2000), // Enforce max length
        type: type || "text",
        imageUrl: imageUrl || null,
      });

      // Acknowledge back to the sender
      socket.emit("chat:message_sent", { message, conversationId });

      // Also broadcast to the conversation room (so both parties see it live)
      const roomName = `conversation:${conversationId}`;
      socket.to(roomName).emit("chat:message", { message, conversationId });
    } catch (err) {
      logger.error("Socket chat:send failed", {
        userId,
        conversationId,
        error: err.message,
      });
      socket.emit("chat:error", {
        message: "Failed to send message",
      });
    }
  });

  /**
   * Mark a conversation as read via socket
   * Client emits: socket.emit('chat:read', { conversationId })
   */
  socket.on("chat:read", async ({ conversationId }) => {
    try {
      if (!conversationId) return;

      await chatService.markConversationAsRead(conversationId, userId);

      // The service already emits chat:messages_read to the other participant
    } catch (err) {
      logger.debug("Socket chat:read failed", {
        userId,
        conversationId,
        error: err.message,
      });
    }
  });
};

module.exports = { registerChatHandlers };
