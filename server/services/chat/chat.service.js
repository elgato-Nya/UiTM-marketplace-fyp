const { Conversation, Message, User, Listing } = require("../../models");
const logger = require("../../utils/logger");
const {
  handleServiceError,
  handleNotFoundError,
} = require("../base.service");
const {
  createValidationError,
  createForbiddenError,
} = require("../../utils/errors");
const { emitToUser } = require("../../socket");
const { createNotification } = require("../notification/notification.service");
const { NotificationType } = require("../../utils/enums/notification.enum");

// ==================== CONVERSATION OPERATIONS ====================

/**
 * Get or create a conversation between two users, optionally tied to a listing
 *
 * @param {string} initiatorId  - The user starting the conversation
 * @param {string} recipientId  - The other user
 * @param {string|null} listingId - Optional listing context
 * @returns {Object} { conversation, created }
 */
const getOrCreateConversation = async (initiatorId, recipientId, listingId = null) => {
  try {
    if (initiatorId.toString() === recipientId.toString()) {
      throw createValidationError("Cannot start a conversation with yourself");
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId).select("_id profile.username email");
    if (!recipient) {
      handleNotFoundError("User", "USER_NOT_FOUND", "get_or_create_conversation", {
        recipientId,
      });
    }

    // Verify listing if provided
    if (listingId) {
      const listing = await Listing.findById(listingId).select("_id");
      if (!listing) {
        handleNotFoundError("Listing", "LISTING_NOT_FOUND", "get_or_create_conversation", {
          listingId,
        });
      }
    }

    // Sort participant IDs to ensure consistent uniqueness regardless of who initiates
    const sortedIds = [initiatorId.toString(), recipientId.toString()].sort();

    // Try to find an existing conversation for this pair + listing
    let conversation = await Conversation.findOne({
      "participants.userId": { $all: sortedIds.map((id) => id) },
      listing: listingId || null,
      isActive: true,
    }).populate("participants.userId", "profile.username profile.avatarUrl email");

    if (conversation) {
      // Re-activate if the initiator had previously soft-deleted it
      const selfEntry = conversation.participants.find(
        (p) => p.userId._id.toString() === initiatorId.toString()
      );
      if (selfEntry?.deletedAt) {
        selfEntry.deletedAt = null;
        await conversation.save();
      }

      return { conversation, created: false };
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [
        { userId: sortedIds[0] },
        { userId: sortedIds[1] },
      ],
      listing: listingId || null,
    });

    // Populate for the response
    conversation = await Conversation.findById(conversation._id)
      .populate("participants.userId", "profile.username profile.avatarUrl email")
      .populate("listing", "name images price");

    logger.info("Conversation created", {
      conversationId: conversation._id.toString(),
      initiatorId,
      recipientId,
      listingId: listingId || "none",
    });

    return { conversation, created: true };
  } catch (error) {
    handleServiceError(error, "getOrCreateConversation", { initiatorId, recipientId });
  }
};

/**
 * Get all conversations for a user (inbox view)
 *
 * @param {string} userId - The authenticated user
 * @param {Object} options - { page, limit }
 * @returns {Object} { conversations, pagination }
 */
const getUserConversations = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const filter = {
      "participants.userId": userId,
      isActive: true,
      // Exclude conversations soft-deleted by this user
      participants: {
        $elemMatch: {
          userId,
          deletedAt: null,
        },
      },
    };

    const [conversations, totalCount] = await Promise.all([
      Conversation.find(filter)
        .populate("participants.userId", "profile.username profile.avatarUrl email")
        .populate("listing", "name images price")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments(filter),
    ]);

    return {
      conversations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalConversations: totalCount,
        hasMore: skip + conversations.length < totalCount,
      },
    };
  } catch (error) {
    handleServiceError(error, "getUserConversations", { userId });
  }
};

/**
 * Get a single conversation by ID (with access check)
 */
const getConversationById = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId)
      .populate("participants.userId", "profile.username profile.avatarUrl email")
      .populate("listing", "name images price");

    if (!conversation) {
      handleNotFoundError("Conversation", "CONVERSATION_NOT_FOUND", "get_conversation", {
        conversationId,
      });
    }

    if (!conversation.isParticipant(userId)) {
      throw createForbiddenError("You are not a participant of this conversation");
    }

    return conversation;
  } catch (error) {
    handleServiceError(error, "getConversationById", { conversationId, userId });
  }
};

// ==================== MESSAGE OPERATIONS ====================

/**
 * Send a message in a conversation
 *
 * @param {string} conversationId - Target conversation
 * @param {string} senderId       - The sender's user ID
 * @param {Object} messageData    - { content, type, imageUrl }
 * @returns {Object} The created message document
 */
const sendMessage = async (conversationId, senderId, messageData) => {
  try {
    const { content, type = "text", imageUrl = null } = messageData;

    // Validate conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      handleNotFoundError("Conversation", "CONVERSATION_NOT_FOUND", "send_message", {
        conversationId,
      });
    }

    if (!conversation.isParticipant(senderId)) {
      throw createForbiddenError("You are not a participant of this conversation");
    }

    if (!conversation.isActive) {
      throw createValidationError("This conversation has been deactivated");
    }

    // Create the message
    const message = await Message.create({
      conversationId,
      sender: senderId,
      content,
      type,
      imageUrl,
      readBy: [{ userId: senderId, readAt: new Date() }], // Sender auto-reads
    });

    // Update conversation's lastMessage and increment recipient's unread count
    const otherParticipant = conversation.getOtherParticipant(senderId);
    const truncatedContent =
      type === "image" ? "📷 Image" : content.substring(0, 100);

    conversation.lastMessage = {
      content: truncatedContent,
      senderId,
      sentAt: new Date(),
      type,
    };

    if (otherParticipant) {
      otherParticipant.unreadCount += 1;

      // Re-activate for recipient if they had soft-deleted the conversation
      if (otherParticipant.deletedAt) {
        otherParticipant.deletedAt = null;
      }
    }

    await conversation.save();

    // Populate sender info for the emitted event
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "profile.username profile.avatarUrl")
      .lean();

    // Push real-time message to the other participant via WebSocket
    if (otherParticipant) {
      const recipientId = otherParticipant.userId.toString();

      emitToUser(recipientId, "chat:message", {
        message: populatedMessage,
        conversationId,
      });

      // Also bump their unread-conversations badge
      emitToUser(recipientId, "chat:unread_update", {
        conversationId,
        unreadCount: otherParticipant.unreadCount,
      });

      // Fire an in-app notification for the new message
      const sender = await User.findById(senderId).select("profile.username");
      const senderName = sender?.profile?.username || "Someone";

      createNotification({
        userId: recipientId,
        type: NotificationType.NEW_CHAT_MESSAGE,
        title: `New message from ${senderName}`,
        message: truncatedContent,
        data: { conversationId, senderId: senderId.toString() },
      }).catch((notifErr) => {
        logger.debug("Chat notification skipped or failed", {
          error: notifErr.message,
        });
      });
    }

    logger.info("Message sent", {
      messageId: message._id.toString(),
      conversationId,
      senderId,
    });

    return populatedMessage;
  } catch (error) {
    handleServiceError(error, "sendMessage", { conversationId, senderId });
  }
};

/**
 * Get paginated messages for a conversation
 *
 * @param {string} conversationId - Conversation ID
 * @param {string} userId         - Requesting user (access check)
 * @param {Object} options        - { page, limit }
 * @returns {Object} { messages, pagination }
 */
const getMessages = async (conversationId, userId, options = {}) => {
  try {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    // Verify access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      handleNotFoundError("Conversation", "CONVERSATION_NOT_FOUND", "get_messages", {
        conversationId,
      });
    }

    if (!conversation.isParticipant(userId)) {
      throw createForbiddenError("You are not a participant of this conversation");
    }

    const filter = {
      conversationId,
      deletedFor: { $ne: userId }, // Exclude messages soft-deleted by this user
    };

    const [messages, totalCount] = await Promise.all([
      Message.find(filter)
        .populate("sender", "profile.username profile.avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments(filter),
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalMessages: totalCount,
        hasMore: skip + messages.length < totalCount,
      },
    };
  } catch (error) {
    handleServiceError(error, "getMessages", { conversationId, userId });
  }
};

/**
 * Mark all messages in a conversation as read for a user
 */
const markConversationAsRead = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      handleNotFoundError("Conversation", "CONVERSATION_NOT_FOUND", "mark_read", {
        conversationId,
      });
    }

    if (!conversation.isParticipant(userId)) {
      throw createForbiddenError("You are not a participant of this conversation");
    }

    // Reset unread count on the conversation
    await conversation.markReadForUser(userId);

    // Bulk-add readBy entry to all unread messages from the other party
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        "readBy.userId": { $ne: userId },
      },
      {
        $push: { readBy: { userId, readAt: new Date() } },
      }
    );

    // Notify the other user that their messages were read (real-time)
    const otherParticipant = conversation.getOtherParticipant(userId);
    if (otherParticipant) {
      emitToUser(otherParticipant.userId.toString(), "chat:messages_read", {
        conversationId,
        readBy: userId,
        readAt: new Date(),
      });
    }

    logger.info("Conversation marked as read", { conversationId, userId });

    return { success: true, conversationId };
  } catch (error) {
    handleServiceError(error, "markConversationAsRead", { conversationId, userId });
  }
};

/**
 * Soft-delete a conversation for a specific user
 * The other participant can still see the full thread
 */
const deleteConversationForUser = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      handleNotFoundError("Conversation", "CONVERSATION_NOT_FOUND", "delete_conversation", {
        conversationId,
      });
    }

    if (!conversation.isParticipant(userId)) {
      throw createForbiddenError("You are not a participant of this conversation");
    }

    const participant = conversation.participants.find(
      (p) => p.userId.toString() === userId.toString()
    );
    participant.deletedAt = new Date();
    await conversation.save();

    logger.info("Conversation soft-deleted for user", { conversationId, userId });

    return { success: true };
  } catch (error) {
    handleServiceError(error, "deleteConversationForUser", { conversationId, userId });
  }
};

/**
 * Get total unread message count across all conversations for a user
 */
const getTotalUnreadCount = async (userId) => {
  try {
    const result = await Conversation.aggregate([
      {
        $match: {
          "participants.userId": userId,
          isActive: true,
        },
      },
      { $unwind: "$participants" },
      {
        $match: {
          "participants.userId": userId,
          "participants.deletedAt": null,
        },
      },
      {
        $group: {
          _id: null,
          totalUnread: { $sum: "$participants.unreadCount" },
        },
      },
    ]);

    return { totalUnread: result[0]?.totalUnread || 0 };
  } catch (error) {
    handleServiceError(error, "getTotalUnreadCount", { userId });
  }
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
  sendMessage,
  getMessages,
  markConversationAsRead,
  deleteConversationForUser,
  getTotalUnreadCount,
};
