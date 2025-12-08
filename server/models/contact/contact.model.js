const mongoose = require("mongoose");

/**
 * Contact Submission Schema
 *
 * PURPOSE: Store contact form submissions for bug reports, enquiries, feedback, collaboration requests, and content reports
 * SCOPE: Platform communication, issue tracking, and content moderation
 * FEATURES:
 * - Multiple submission types (bug, enquiry, feedback, collaboration, content_report)
 * - Optional user association (logged-in users or guests)
 * - Admin status tracking and response
 * - Priority levels for urgent issues
 * - File attachments support (screenshots for bugs, documents for collaboration)
 * - Content moderation (report listings, users, shops for spam/fraud/harassment)
 */

const contactSchema = new mongoose.Schema(
  {
    // Submission Type
    type: {
      type: String,
      enum: [
        "bug_report",
        "enquiry",
        "feedback",
        "collaboration",
        "content_report",
        "other",
      ],
      required: [true, "Submission type is required"],
      index: true,
    },

    // Submitter Information
    submittedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // Null for guest submissions
      },
      name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxlength: [100, "Name cannot exceed 100 characters"],
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Please provide a valid email address",
        ],
      },
      phoneNumber: {
        type: String,
        trim: true,
        maxlength: [15, "Phone number cannot exceed 15 characters"],
      },
      isGuest: {
        type: Boolean,
        default: true,
      },
    },

    // Submission Details
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    // Bug Report Specific Fields
    bugDetails: {
      severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: null,
      },
      expectedBehavior: {
        type: String,
        trim: true,
        maxlength: [500, "Expected behavior description too long"],
      },
      actualBehavior: {
        type: String,
        trim: true,
        maxlength: [500, "Actual behavior description too long"],
      },
      stepsToReproduce: {
        type: String,
        trim: true,
        maxlength: [1000, "Steps description too long"],
      },
      browser: String,
      deviceType: {
        type: String,
        enum: ["desktop", "mobile", "tablet"],
      },
      screenshots: [
        {
          url: {
            type: String,
            required: true,
          },
          key: {
            type: String,
            required: true,
          },
          filename: String,
          fileSize: Number,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Feedback Specific Fields (added image support)
    feedbackDetails: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      screenshots: [
        {
          url: {
            type: String,
            required: true,
          },
          key: {
            type: String,
            required: true,
          },
          filename: String,
          fileSize: Number,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Collaboration Request Specific Fields
    collaborationDetails: {
      proposalType: {
        type: String,
        enum: ["partnership", "sponsorship", "integration", "other"],
      },
      organizationName: String,
      website: String,
      proposalDocument: {
        url: String,
        key: String,
        filename: String,
      },
    },

    // Content Report Specific Fields (for reporting spam, fraud, harassment, etc.)
    contentReport: {
      reportedEntityType: {
        type: String,
        enum: ["listing", "user", "shop"],
      },
      reportedEntity: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "contentReport.reportedEntityType",
      },
      category: {
        type: String,
        enum: [
          "spam",
          "fraud",
          "scam",
          "counterfeit",
          "harassment",
          "inappropriate_content",
          "illegal_content",
          "violence",
          "hate_speech",
          "other",
        ],
      },
      evidence: [
        {
          type: {
            type: String,
            enum: ["screenshot", "link", "description"],
          },
          url: String,
          key: String,
          description: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      actionTaken: {
        type: String,
        enum: [
          "content_removed",
          "user_warned",
          "user_suspended",
          "listing_removed",
          "shop_suspended",
          "no_action",
        ],
      },
    },

    // Attachments (General) - Admin use only, not populated from client submissions
    attachments: [
      {
        url: String,
        key: String,
        filename: String,
        fileType: String,
      },
    ],

    // Admin Management
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "closed", "spam"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
      index: true,
    },

    // Admin Response
    adminResponse: {
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      responseMessage: String,
      respondedAt: Date,
    },

    // Assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Internal Notes (Admin only) - Never populated from client submissions
    internalNotes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Resolution
    resolvedAt: Date,
    resolutionSummary: String,

    // Tracking
    ipAddress: String,
    userAgent: String,
    referralSource: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ type: 1, status: 1 });
contactSchema.index({ "submittedBy.email": 1 });
contactSchema.index({ priority: 1, status: 1 });
contactSchema.index({ "contentReport.reportedEntity": 1, type: 1 }); // For content reports
contactSchema.index({ "contentReport.category": 1, status: 1 }); // For filtering reports by category

// Virtual for response time
contactSchema.virtual("responseTime").get(function () {
  if (this.adminResponse?.respondedAt && this.createdAt) {
    return this.adminResponse.respondedAt - this.createdAt;
  }
  return null;
});

// Pre-save middleware
contactSchema.pre("save", function (next) {
  // Set isGuest based on userId presence
  if (this.submittedBy) {
    this.submittedBy.isGuest = !this.submittedBy.userId;
  }

  // Content reports require authenticated users
  if (this.type === "content_report" && this.submittedBy.isGuest) {
    return next(
      new Error("Content reports can only be submitted by logged-in users")
    );
  }

  // Auto-set priority for content reports based on category
  if (this.type === "content_report" && this.contentReport?.category) {
    const criticalCategories = ["fraud", "illegal_content", "violence"];
    const highCategories = ["scam", "counterfeit", "harassment", "hate_speech"];

    if (criticalCategories.includes(this.contentReport.category)) {
      this.priority = "urgent";
    } else if (highCategories.includes(this.contentReport.category)) {
      this.priority = "high";
    }
  }

  // Auto-set resolvedAt when status changes to resolved/closed
  if (
    (this.status === "resolved" || this.status === "closed") &&
    !this.resolvedAt
  ) {
    this.resolvedAt = new Date();
  }

  // Clear resolvedAt if status is reopened
  if (
    this.status !== "resolved" &&
    this.status !== "closed" &&
    this.resolvedAt
  ) {
    this.resolvedAt = undefined;
  }

  next();
});

// Static method to get statistics
contactSchema.statics.getStatistics = async function (filters = {}) {
  const pipeline = [
    ...(Object.keys(filters).length > 0 ? [{ $match: filters }] : []),
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        pendingCount: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        inProgressCount: {
          $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
        },
        resolvedCount: {
          $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
        },
        closedCount: {
          $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
        },
        bugReports: { $sum: { $cond: [{ $eq: ["$type", "bug"] }, 1, 0] } },
        enquiries: { $sum: { $cond: [{ $eq: ["$type", "enquiry"] }, 1, 0] } },
        feedbacks: { $sum: { $cond: [{ $eq: ["$type", "feedback"] }, 1, 0] } },
        collaborations: {
          $sum: { $cond: [{ $eq: ["$type", "collaboration"] }, 1, 0] },
        },
        contentReports: {
          $sum: { $cond: [{ $eq: ["$type", "content_report"] }, 1, 0] },
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
        },
        urgentPriority: {
          $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] },
        },
      },
    },
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

// Static method to get reports by entity (for content reports)
contactSchema.statics.getReportsByEntity = async function (
  entityType,
  entityId
) {
  return this.find({
    type: "content_report",
    "contentReport.reportedEntityType": entityType,
    "contentReport.reportedEntity": entityId,
  })
    .populate("submittedBy.userId", "profile.username email")
    .sort({ createdAt: -1 })
    .lean();
};

// Static method to count reports by entity
contactSchema.statics.countReportsByEntity = async function (
  entityType,
  entityId
) {
  return this.countDocuments({
    type: "content_report",
    "contentReport.reportedEntityType": entityType,
    "contentReport.reportedEntity": entityId,
    status: { $in: ["pending", "in-progress"] }, // Only active reports
  });
};

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
