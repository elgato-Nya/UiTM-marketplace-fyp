const mongoose = require("mongoose");

/**
 * Conversation Model
 *
 * PURPOSE: Represents a private 1-to-1 chat thread between two users
 * CONTEXT: Conversations can optionally reference a listing (e.g., buyer asking seller about a product)
 * DESIGN:
 *   - participants array is exactly 2 users (buyer ↔ seller or any user pair)
 *   - lastMessage is denormalized for fast conversation-list rendering
 *   - Each participant has their own unreadCount + deletedAt (soft-delete per user)
 *   - Unique compound index prevents duplicate conversations between the same pair + listing
 */

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Per-user soft delete — user won't see the conversation but the other party still can */
    deletedAt: {
      type: Date,
      default: null,
    },
    /** Timestamp of the last message the user has seen/read */
    lastReadAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [participantSchema],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "A conversation must have exactly 2 participants",
      },
      required: true,
    },

    /** Optional listing context — e.g., buyer messaging a seller about a specific product */
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      default: null,
    },

    /** Denormalized last message preview for inbox rendering */
    lastMessage: {
      content: { type: String, default: "" },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      sentAt: { type: Date, default: null },
      type: {
        type: String,
        enum: ["text", "image", "system"],
        default: "text",
      },
    },

    /** Active flag — admins can deactivate abusive threads */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================

// Prevent duplicate conversations for the same user pair + listing
conversationSchema.index(
  { "participants.userId": 1, listing: 1 },
  { unique: true }
);

// Fast lookup: "get all conversations for user X, newest first"
conversationSchema.index(
  { "participants.userId": 1, updatedAt: -1 }
);

// ==================== INSTANCE METHODS ====================

/**
 * Get the other participant (the one who is NOT the given userId)
 */
conversationSchema.methods.getOtherParticipant = function (userId) {
  const uid = userId.toString();
  return this.participants.find((p) => p.userId.toString() !== uid);
};

/**
 * Check if a user is a member of this conversation
 */
conversationSchema.methods.isParticipant = function (userId) {
  const uid = userId.toString();
  return this.participants.some((p) => p.userId.toString() === uid);
};

/**
 * Reset unread counter for a specific participant
 */
conversationSchema.methods.markReadForUser = async function (userId) {
  const uid = userId.toString();
  const participant = this.participants.find(
    (p) => p.userId.toString() === uid
  );
  if (participant) {
    participant.unreadCount = 0;
    participant.lastReadAt = new Date();
    await this.save();
  }
};

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { Conversation, conversationSchema };
