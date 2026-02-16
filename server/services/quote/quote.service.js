const { QuoteRequest, Listing, User } = require("../../models");
const {
  createForbiddenError,
  createValidationError,
  createNotFoundError,
} = require("../../utils/errors");
const {
  handleServiceError,
  handleNotFoundError,
  buildSort,
} = require("../base.service");
const {
  QuoteStatus,
  QuoteCancelReason,
  QuoteExpiryDays,
} = require("../../utils/enums/quote.enum");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/notification.service");
const { NotificationType } = require("../../utils/enums/notification.enum");

// Create a new quote request
const createQuoteRequest = async (userId, quoteData) => {
  try {
    const {
      listingId,
      message,
      budget,
      timeline,
      priority,
      customFieldValues,
    } = quoteData;

    // Get listing with quote settings
    const listing = await Listing.findById(listingId)
      .select("name type quoteSettings seller images")
      .populate("seller.userId", "email profile merchantDetails");

    if (!listing) {
      return handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "create_quote",
        { listingId },
      );
    }

    // Verify listing accepts quotes
    if (!listing.quoteSettings?.enabled) {
      logger.warn("Quote request attempted on non-quote listing", {
        listingId,
        userId,
        listingType: listing.type,
      });
      throw createValidationError(
        "This listing does not accept quote requests",
        { listingId },
        "LISTING_NOT_QUOTE_BASED",
      );
    }

    // Get buyer info
    const buyer = await User.findById(userId).select("+email profile");
    if (!buyer) {
      return handleNotFoundError("User", "USER_NOT_FOUND", "create_quote", {
        userId,
      });
    }

    if (!buyer.profile?.username) {
      throw createValidationError(
        "Please complete your profile before requesting a quote",
        { userId },
        "INCOMPLETE_PROFILE",
      );
    }

    // Prevent self-quotes
    if (listing.seller.userId._id.toString() === userId.toString()) {
      logger.warn("Self-quote attempt blocked", { userId, listingId });
      throw createForbiddenError(
        "You cannot request a quote on your own listing",
      );
    }

    // Check for existing pending quote from same buyer
    const existingQuote = await QuoteRequest.findOne({
      "listing.listingId": listingId,
      "buyer.userId": userId,
      status: { $in: [QuoteStatus.PENDING, QuoteStatus.QUOTED] },
      isDeleted: false,
    });

    if (existingQuote) {
      logger.warn("Duplicate quote request blocked", {
        userId,
        listingId,
        existingQuoteId: existingQuote._id,
      });
      throw createValidationError(
        "You already have a pending quote request for this listing",
        { existingQuoteId: existingQuote._id },
        "DUPLICATE_QUOTE_REQUEST",
      );
    }

    const seller = listing.seller.userId;
    const sellerDisplayName =
      seller.merchantDetails?.shopName || seller.profile?.username;

    const quoteRequest = new QuoteRequest({
      listing: {
        listingId: listing._id,
        name: listing.name,
        image: listing.images?.[0] || null,
        quoteSettingsSnapshot: {
          minPrice: listing.quoteSettings.minPrice,
          maxPrice: listing.quoteSettings.maxPrice,
          responseTime: listing.quoteSettings.responseTime,
          requiresDeposit: listing.quoteSettings.requiresDeposit,
          depositPercentage: listing.quoteSettings.depositPercentage,
        },
      },
      buyer: {
        userId: buyer._id,
        username: buyer.profile.username,
        email: buyer.email,
      },
      seller: {
        userId: seller._id,
        username: seller.profile?.username,
        email: seller.email,
        shopName: sellerDisplayName,
        shopSlug: seller.merchantDetails?.shopSlug,
      },
      request: {
        message,
        budget: budget || null,
        timeline: timeline || null,
        priority: priority || "normal",
        customFieldValues: customFieldValues || [],
      },
    });

    await quoteRequest.save();

    logger.info("Quote request created", {
      quoteId: quoteRequest._id,
      listingId,
      buyerId: userId,
      sellerId: seller._id,
    });

    // Fire-and-forget: notify seller about new quote request
    createNotification({
      userId: seller._id,
      type: NotificationType.QUOTE_REQUEST_RECEIVED,
      title: "New Quote Request",
      message: `${quoteRequest.buyer.username} requested a quote for "${quoteRequest.listing.name}"`,
      data: {
        quoteId: quoteRequest._id,
        listingId,
        buyerName: quoteRequest.buyer.username,
        listingName: quoteRequest.listing.name,
      },
    }).catch((err) =>
      logger.error("Failed to send quote request notification", {
        error: err.message,
        quoteId: quoteRequest._id,
      })
    );

    return quoteRequest;
  } catch (error) {
    handleServiceError(error, "create_quote_request", {
      userId,
      listingId: quoteData.listingId,
    });
  }
};

// Get quote by ID
const getQuoteById = async (quoteId, userId, userRoles) => {
  try {
    const quote = await QuoteRequest.findOne({
      _id: quoteId,
      isDeleted: false,
    });

    if (!quote) {
      throw createNotFoundError("Quote request");
    }

    // Check permissions
    const isBuyer = quote.buyer.userId.toString() === userId.toString();
    const isSeller = quote.seller.userId.toString() === userId.toString();
    const isAdmin = userRoles && userRoles.includes("admin");

    if (!isBuyer && !isSeller && !isAdmin) {
      logger.security("Unauthorized quote access attempt", {
        quoteId,
        attemptedBy: userId,
        buyerId: quote.buyer.userId,
        sellerId: quote.seller.userId,
      });
      throw createForbiddenError("You are not a participant in this quote");
    }

    return {
      quote,
      perspective: isBuyer ? "buyer" : isSeller ? "seller" : "admin",
    };
  } catch (error) {
    handleServiceError(error, "get_quote_by_id", { quoteId, userId });
  }
};

// Get quotes for buyer
const getBuyerQuotes = async (userId, options = {}) => {
  try {
    const { status, page = 1, limit = 10, sort } = options;

    const query = {
      "buyer.userId": userId,
      isDeleted: false,
    };

    if (status) {
      query.status = status;
    }

    const allowedSortFields = ["createdAt", "updatedAt", "status", "expiresAt"];
    const sortObj = buildSort({ sort }, allowedSortFields);

    const skip = (page - 1) * limit;

    const [quotes, total] = await Promise.all([
      QuoteRequest.find(query).sort(sortObj).skip(skip).limit(limit),
      QuoteRequest.countDocuments(query),
    ]);

    return {
      quotes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handleServiceError(error, "get_buyer_quotes", { userId });
  }
};

// Get quotes for seller
const getSellerQuotes = async (userId, options = {}) => {
  try {
    const { status, page = 1, limit = 10, sort, priority } = options;

    const query = {
      "seller.userId": userId,
      isDeleted: false,
    };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query["request.priority"] = priority;
    }

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "status",
      "expiresAt",
      "request.priority",
    ];
    const sortObj = buildSort({ sort }, allowedSortFields);

    const skip = (page - 1) * limit;

    const [quotes, total] = await Promise.all([
      QuoteRequest.find(query).sort(sortObj).skip(skip).limit(limit),
      QuoteRequest.countDocuments(query),
    ]);

    // Get counts by status for dashboard
    const statusCounts = await QuoteRequest.aggregate([
      { $match: { "seller.userId": userId, isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      quotes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats,
    };
  } catch (error) {
    handleServiceError(error, "get_seller_quotes", { userId });
  }
};

// Seller provides quote
const provideQuote = async (quoteId, sellerId, quoteData) => {
  try {
    const {
      quotedPrice,
      estimatedDuration,
      message,
      depositRequired,
      depositAmount,
      depositPercentage,
      terms,
    } = quoteData;

    const quote = await QuoteRequest.findOne({
      _id: quoteId,
      isDeleted: false,
    });

    if (!quote) {
      throw createNotFoundError("Quote request");
    }

    // Verify seller owns this quote
    if (quote.seller.userId.toString() !== sellerId.toString()) {
      logger.security("Unauthorized quote response attempt", {
        quoteId,
        attemptedBy: sellerId,
        actualSeller: quote.seller.userId,
      });
      throw createForbiddenError(
        "You can only respond to your own quote requests",
      );
    }

    // Verify quote is pending
    if (quote.status !== QuoteStatus.PENDING) {
      throw createValidationError(
        `Cannot respond to quote in ${quote.status} status`,
        { currentStatus: quote.status },
        "INVALID_QUOTE_STATUS",
      );
    }

    // Check if expired
    if (quote.isExpired) {
      quote.markExpired();
      await quote.save();
      throw createValidationError(
        "This quote request has expired",
        { quoteId },
        "QUOTE_EXPIRED",
      );
    }

    // Provide the quote
    quote.provideQuote(
      {
        quotedPrice,
        estimatedDuration,
        message,
        depositRequired: depositRequired || false,
        depositAmount,
        depositPercentage,
        terms,
      },
      sellerId,
    );

    await quote.save();

    logger.info("Quote provided by seller", {
      quoteId,
      sellerId,
      quotedPrice,
      buyerId: quote.buyer.userId,
    });

    // Fire-and-forget: notify buyer that seller provided a quote
    createNotification({
      userId: quote.buyer.userId,
      type: NotificationType.QUOTE_RESPONSE_RECEIVED,
      title: "Quote Response Received",
      message: `${quote.seller.shopName || quote.seller.username} quoted RM ${quotedPrice.toFixed(2)} for "${quote.listing.name}"`,
      data: {
        quoteId,
        listingId: quote.listing.listingId,
        sellerName: quote.seller.shopName || quote.seller.username,
        quotedPrice,
      },
    }).catch((err) =>
      logger.error("Failed to send quote response notification", {
        error: err.message,
        quoteId,
      })
    );

    return quote;
  } catch (error) {
    handleServiceError(error, "provide_quote", { quoteId, sellerId });
  }
};

// Buyer accepts quote
const acceptQuote = async (quoteId, buyerId) => {
  try {
    const quote = await QuoteRequest.findOne({
      _id: quoteId,
      isDeleted: false,
    });

    if (!quote) {
      throw createNotFoundError("Quote request");
    }

    // Verify buyer owns this quote
    if (quote.buyer.userId.toString() !== buyerId.toString()) {
      throw createForbiddenError("You can only accept quotes you requested");
    }

    // Verify quote has been responded to
    if (quote.status !== QuoteStatus.QUOTED) {
      throw createValidationError(
        `Cannot accept quote in ${quote.status} status`,
        { currentStatus: quote.status },
        "INVALID_QUOTE_STATUS",
      );
    }

    // Check if expired
    if (quote.isExpired) {
      quote.markExpired();
      await quote.save();
      throw createValidationError(
        "This quote has expired",
        { quoteId },
        "QUOTE_EXPIRED",
      );
    }

    quote.acceptQuote(buyerId);
    await quote.save();

    logger.info("Quote accepted by buyer", {
      quoteId,
      buyerId,
      sellerId: quote.seller.userId,
      quotedPrice: quote.sellerQuote.quotedPrice,
    });

    // Fire-and-forget: notify seller that buyer accepted the quote
    createNotification({
      userId: quote.seller.userId,
      type: NotificationType.QUOTE_ACCEPTED,
      title: "Quote Accepted",
      message: `${quote.buyer.username} accepted your quote of RM ${quote.sellerQuote.quotedPrice.toFixed(2)} for "${quote.listing.name}"`,
      data: {
        quoteId,
        listingId: quote.listing.listingId,
        buyerName: quote.buyer.username,
        quotedPrice: quote.sellerQuote.quotedPrice,
      },
    }).catch((err) =>
      logger.error("Failed to send quote accepted notification", {
        error: err.message,
        quoteId,
      })
    );

    return quote;
  } catch (error) {
    handleServiceError(error, "accept_quote", { quoteId, buyerId });
  }
};

// Buyer rejects quote
const rejectQuote = async (quoteId, buyerId, reason = null) => {
  try {
    const quote = await QuoteRequest.findOne({
      _id: quoteId,
      isDeleted: false,
    });

    if (!quote) {
      throw createNotFoundError("Quote request");
    }

    if (quote.buyer.userId.toString() !== buyerId.toString()) {
      throw createForbiddenError("You can only reject quotes you requested");
    }

    if (quote.status !== QuoteStatus.QUOTED) {
      throw createValidationError(
        `Cannot reject quote in ${quote.status} status`,
        { currentStatus: quote.status },
        "INVALID_QUOTE_STATUS",
      );
    }

    quote.rejectQuote(buyerId, reason);
    await quote.save();

    logger.info("Quote rejected by buyer", {
      quoteId,
      buyerId,
      sellerId: quote.seller.userId,
      reason,
    });

    // Fire-and-forget: notify seller that buyer rejected the quote
    createNotification({
      userId: quote.seller.userId,
      type: NotificationType.QUOTE_REJECTED,
      title: "Quote Rejected",
      message: `${quote.buyer.username} rejected your quote for "${quote.listing.name}"${reason ? ` — ${reason}` : ""}`,
      data: {
        quoteId,
        listingId: quote.listing.listingId,
        buyerName: quote.buyer.username,
        reason,
      },
    }).catch((err) =>
      logger.error("Failed to send quote rejected notification", {
        error: err.message,
        quoteId,
      })
    );

    return quote;
  } catch (error) {
    handleServiceError(error, "reject_quote", { quoteId, buyerId });
  }
};

// Cancel quote
const cancelQuote = async (
  quoteId,
  userId,
  userRoles,
  cancelReason,
  note = null,
) => {
  try {
    const quote = await QuoteRequest.findOne({
      _id: quoteId,
      isDeleted: false,
    });

    if (!quote) {
      throw createNotFoundError("Quote request");
    }

    const isBuyer = quote.buyer.userId.toString() === userId.toString();
    const isSeller = quote.seller.userId.toString() === userId.toString();
    const isAdmin = userRoles && userRoles.includes("admin");

    if (!isBuyer && !isSeller && !isAdmin) {
      throw createForbiddenError("You are not a participant in this quote");
    }

    // Check if cancellation is allowed based on status
    const cancellableStatuses = [
      QuoteStatus.PENDING,
      QuoteStatus.QUOTED,
      QuoteStatus.ACCEPTED,
    ];

    if (!cancellableStatuses.includes(quote.status)) {
      throw createValidationError(
        `Cannot cancel quote in ${quote.status} status`,
        { currentStatus: quote.status },
        "CANNOT_CANCEL_QUOTE",
      );
    }

    const role = isAdmin ? "admin" : isBuyer ? "buyer" : "seller";
    quote.cancelQuote(userId, role, cancelReason, note);
    await quote.save();

    logger.info("Quote cancelled", {
      quoteId,
      cancelledBy: userId,
      role,
      reason: cancelReason,
    });

    // Fire-and-forget: notify the other party about cancellation
    const recipientId = isBuyer ? quote.seller.userId : quote.buyer.userId;
    const cancellerName = isBuyer
      ? quote.buyer.username
      : quote.seller.shopName || quote.seller.username;
    createNotification({
      userId: recipientId,
      type: NotificationType.QUOTE_EXPIRED,
      title: "Quote Cancelled",
      message: `${cancellerName} cancelled the quote for "${quote.listing.name}"${cancelReason ? ` — Reason: ${cancelReason}` : ""}`,
      data: {
        quoteId,
        listingId: quote.listing.listingId,
        cancelledBy: userId,
        cancellerRole: role,
        cancelReason,
      },
    }).catch((err) =>
      logger.error("Failed to send quote cancelled notification", {
        error: err.message,
        quoteId,
      })
    );

    return quote;
  } catch (error) {
    handleServiceError(error, "cancel_quote", { quoteId, userId });
  }
};

// Mark quote as paid (called after payment processing)
const markQuotePaid = async (quoteId, paymentData) => {
  try {
    const quote = await QuoteRequest.findOne({
      _id: quoteId,
      isDeleted: false,
    });

    if (!quote) {
      throw createNotFoundError("Quote request");
    }

    if (quote.status !== QuoteStatus.ACCEPTED) {
      throw createValidationError(
        "Quote must be accepted before payment",
        { currentStatus: quote.status },
        "INVALID_QUOTE_STATUS",
      );
    }

    quote.markPaid(paymentData);
    await quote.save();

    logger.info("Quote marked as paid", {
      quoteId,
      buyerId: quote.buyer.userId,
      sellerId: quote.seller.userId,
      amount: paymentData.amount,
    });

    return quote;
  } catch (error) {
    handleServiceError(error, "mark_quote_paid", { quoteId });
  }
};

// Seller starts service
const startService = async (quoteId, sellerId) => {
  try {
    const quote = await QuoteRequest.findOne({
      _id: quoteId,
      isDeleted: false,
    });

    if (!quote) {
      throw createNotFoundError("Quote request");
    }

    if (quote.seller.userId.toString() !== sellerId.toString()) {
      throw createForbiddenError("Only the seller can start the service");
    }

    if (quote.status !== QuoteStatus.PAID) {
      throw createValidationError(
        "Service can only be started after payment",
        { currentStatus: quote.status },
        "INVALID_QUOTE_STATUS",
      );
    }

    quote.startService(sellerId);
    await quote.save();

    logger.info("Service started", {
      quoteId,
      sellerId,
      buyerId: quote.buyer.userId,
    });

    // Fire-and-forget: notify buyer that service has started
    createNotification({
      userId: quote.buyer.userId,
      type: NotificationType.ORDER_PROCESSING,
      title: "Service Started",
      message: `${quote.seller.shopName || quote.seller.username} has started working on your quote for "${quote.listing.name}"`,
      data: {
        quoteId,
        listingId: quote.listing.listingId,
        sellerName: quote.seller.shopName || quote.seller.username,
      },
    }).catch((err) =>
      logger.error("Failed to send service started notification", {
        error: err.message,
        quoteId,
      })
    );

    return quote;
  } catch (error) {
    handleServiceError(error, "start_service", { quoteId, sellerId });
  }
};

// Seller completes service
const completeService = async (quoteId, sellerId, completionNote = null) => {
  try {
    const quote = await QuoteRequest.findOne({
      _id: quoteId,
      isDeleted: false,
    });

    if (!quote) {
      throw createNotFoundError("Quote request");
    }

    if (quote.seller.userId.toString() !== sellerId.toString()) {
      throw createForbiddenError("Only the seller can complete the service");
    }

    if (quote.status !== QuoteStatus.IN_PROGRESS) {
      throw createValidationError(
        "Service must be in progress to complete",
        { currentStatus: quote.status },
        "INVALID_QUOTE_STATUS",
      );
    }

    quote.completeService(sellerId, completionNote);
    await quote.save();

    logger.info("Service completed", {
      quoteId,
      sellerId,
      buyerId: quote.buyer.userId,
    });

    // Fire-and-forget: notify buyer that service has been completed
    createNotification({
      userId: quote.buyer.userId,
      type: NotificationType.ORDER_DELIVERED,
      title: "Service Completed",
      message: `${quote.seller.shopName || quote.seller.username} has completed the service for "${quote.listing.name}"${completionNote ? ` — Note: ${completionNote}` : ""}`,
      data: {
        quoteId,
        listingId: quote.listing.listingId,
        sellerName: quote.seller.shopName || quote.seller.username,
        completionNote,
      },
    }).catch((err) =>
      logger.error("Failed to send service completed notification", {
        error: err.message,
        quoteId,
      })
    );

    return quote;
  } catch (error) {
    handleServiceError(error, "complete_service", { quoteId, sellerId });
  }
};

// Get quotes for a specific listing (for sellers)
const getQuotesByListing = async (listingId, sellerId, options = {}) => {
  try {
    const { status, page = 1, limit = 10 } = options;

    // Verify listing ownership
    const listing = await Listing.findById(listingId).select("seller.userId");
    if (!listing) {
      throw createNotFoundError("Listing");
    }

    if (listing.seller.userId.toString() !== sellerId.toString()) {
      throw createForbiddenError(
        "You can only view quotes for your own listings",
      );
    }

    const query = {
      "listing.listingId": listingId,
      isDeleted: false,
    };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [quotes, total] = await Promise.all([
      QuoteRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      QuoteRequest.countDocuments(query),
    ]);

    return {
      quotes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    handleServiceError(error, "get_quotes_by_listing", { listingId, sellerId });
  }
};

module.exports = {
  createQuoteRequest,
  getQuoteById,
  getBuyerQuotes,
  getSellerQuotes,
  provideQuote,
  acceptQuote,
  rejectQuote,
  cancelQuote,
  markQuotePaid,
  startService,
  completeService,
  getQuotesByListing,
};
