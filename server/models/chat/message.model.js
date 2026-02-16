const mongoose = require("mongoose");

/**
 * Message Model
 *
 * PURPOSE: Individual message inside a Conversation
 * DESIGN:
 *   - References parent Conversation for grouping
 *   - Sender must be one of the conversation's participants
 *   - Supports text, image URLs, and system-generated messages
 *   - Soft-delete per user via deletedFor array
 *   - TTL index auto-purges messages older than 180 days
 */

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation reference is required"],
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },

    content: {
      type: String,
      required: [true, "Message content is required"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
    },

    /** Optional image attachment URL (S3 key or full URL) */
    imageUrl: {
      type: String,
      default: null,
    },

    /** Track read status per recipient */
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /** Per-user soft delete — user won't see the message but the other party still can */
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ==================== INDEXES ====================

// Paginated message history within a conversation (newest first)
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Auto-purge messages after 180 days
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

// ==================== INSTANCE METHODS ====================

/**
 * Mark the message as read by a specific user
 */
messageSchema.methods.markReadBy = async function (userId) {
  const uid = userId.toString();
  const alreadyRead = this.readBy.some(
    (entry) => entry.userId.toString() === uid
  );
  if (!alreadyRead) {
    this.readBy.push({ userId, readAt: new Date() });
    await this.save();
  }
};

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message, messageSchema };
