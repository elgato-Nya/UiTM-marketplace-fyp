const BaseController = require("../base.controller");
const {
  createQuoteRequest,
  getQuoteById,
  getBuyerQuotes,
  getSellerQuotes,
  provideQuote,
  acceptQuote,
  rejectQuote,
  cancelQuote,
  startService,
  completeService,
  getQuotesByListing,
} = require("../../services/quote/quote.service");
const { sanitizeObject, sanitizeQuery } = require("../../utils/sanitizer");
const asyncHandler = require("../../utils/asyncHandler");

const baseController = new BaseController();

const handleCreateQuote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const quoteDataDTO = req.body;

  const sanitizedData = sanitizeObject(quoteDataDTO);
  const quote = await createQuoteRequest(userId, sanitizedData);

  baseController.logAction("create_quote_request", req, {
    buyerId: userId.toString(),
    quoteId: quote._id.toString(),
    listingId: quote.listing.listingId.toString(),
    sellerId: quote.seller.userId.toString(),
  });

  return baseController.sendSuccess(
    res,
    { quote },
    "Quote request submitted successfully",
    201,
  );
}, "handle_create_quote");

const handleGetQuote = asyncHandler(async (req, res) => {
  const { id: quoteId } = req.params;
  const userId = req.user._id;
  const userRoles = req.user.roles;

  const result = await getQuoteById(quoteId, userId, userRoles);

  return baseController.sendSuccess(
    res,
    { quote: result.quote, perspective: result.perspective },
    "Quote retrieved successfully",
  );
}, "handle_get_quote");

const handleGetMyQuotes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const sanitizedQuery = sanitizeQuery(req.query);
  const { page = 1, limit = 10, sort, status, role = "buyer" } = sanitizedQuery;

  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 50),
    sort,
    status,
  };

  let result;
  if (role === "seller") {
    result = await getSellerQuotes(userId, options);
  } else {
    result = await getBuyerQuotes(userId, options);
  }

  return baseController.sendSuccess(
    res,
    result,
    `${role === "seller" ? "Received" : "Sent"} quotes retrieved successfully`,
  );
}, "handle_get_my_quotes");

const handleGetSellerQuotes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const sanitizedQuery = sanitizeQuery(req.query);
  const { page = 1, limit = 10, sort, status, priority } = sanitizedQuery;

  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 50),
    sort,
    status,
    priority,
  };

  const result = await getSellerQuotes(userId, options);

  baseController.logAction("get_seller_quotes", req, {
    sellerId: userId.toString(),
    filters: { status, priority },
    total: result.total,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Quote requests retrieved successfully",
  );
}, "handle_get_seller_quotes");

const handleProvideQuote = asyncHandler(async (req, res) => {
  const { id: quoteId } = req.params;
  const sellerId = req.user._id;
  const quoteDataDTO = req.body;

  const sanitizedData = sanitizeObject(quoteDataDTO);
  const quote = await provideQuote(quoteId, sellerId, sanitizedData);

  baseController.logAction("provide_quote", req, {
    quoteId,
    sellerId: sellerId.toString(),
    buyerId: quote.buyer.userId.toString(),
    quotedPrice: quote.sellerQuote.quotedPrice,
  });

  return baseController.sendSuccess(
    res,
    { quote },
    "Quote provided successfully",
  );
}, "handle_provide_quote");

const handleAcceptQuote = asyncHandler(async (req, res) => {
  const { id: quoteId } = req.params;
  const buyerId = req.user._id;

  const quote = await acceptQuote(quoteId, buyerId);

  baseController.logAction("accept_quote", req, {
    quoteId,
    buyerId: buyerId.toString(),
    sellerId: quote.seller.userId.toString(),
    quotedPrice: quote.sellerQuote.quotedPrice,
  });

  return baseController.sendSuccess(
    res,
    { quote },
    "Quote accepted successfully",
  );
}, "handle_accept_quote");

const handleRejectQuote = asyncHandler(async (req, res) => {
  const { id: quoteId } = req.params;
  const buyerId = req.user._id;
  const { reason } = sanitizeObject(req.body);

  const quote = await rejectQuote(quoteId, buyerId, reason);

  baseController.logAction("reject_quote", req, {
    quoteId,
    buyerId: buyerId.toString(),
    sellerId: quote.seller.userId.toString(),
    reason: reason || null,
  });

  return baseController.sendSuccess(res, { quote }, "Quote rejected");
}, "handle_reject_quote");

const handleCancelQuote = asyncHandler(async (req, res) => {
  const { id: quoteId } = req.params;
  const userId = req.user._id;
  const userRoles = req.user.roles;
  const { reason, note } = sanitizeObject(req.body);

  const quote = await cancelQuote(quoteId, userId, userRoles, reason, note);

  baseController.logAction("cancel_quote", req, {
    quoteId,
    cancelledBy: userId.toString(),
    reason,
  });

  return baseController.sendSuccess(
    res,
    { quote },
    "Quote cancelled successfully",
  );
}, "handle_cancel_quote");

const handleStartService = asyncHandler(async (req, res) => {
  const { id: quoteId } = req.params;
  const sellerId = req.user._id;

  const quote = await startService(quoteId, sellerId);

  baseController.logAction("start_service", req, {
    quoteId,
    sellerId: sellerId.toString(),
    buyerId: quote.buyer.userId.toString(),
  });

  return baseController.sendSuccess(
    res,
    { quote },
    "Service started successfully",
  );
}, "handle_start_service");

const handleCompleteService = asyncHandler(async (req, res) => {
  const { id: quoteId } = req.params;
  const sellerId = req.user._id;
  const { completionNote } = sanitizeObject(req.body);

  const quote = await completeService(quoteId, sellerId, completionNote);

  baseController.logAction("complete_service", req, {
    quoteId,
    sellerId: sellerId.toString(),
    buyerId: quote.buyer.userId.toString(),
  });

  return baseController.sendSuccess(
    res,
    { quote },
    "Service completed successfully",
  );
}, "handle_complete_service");

const handleGetQuotesByListing = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const sellerId = req.user._id;
  const { page = 1, limit = 10, status } = sanitizeQuery(req.query);

  const result = await getQuotesByListing(listingId, sellerId, {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 50),
    status,
  });

  return baseController.sendSuccess(
    res,
    result,
    "Listing quotes retrieved successfully",
  );
}, "handle_get_quotes_by_listing");

module.exports = {
  handleCreateQuote,
  handleGetQuote,
  handleGetMyQuotes,
  handleGetSellerQuotes,
  handleProvideQuote,
  handleAcceptQuote,
  handleRejectQuote,
  handleCancelQuote,
  handleStartService,
  handleCompleteService,
  handleGetQuotesByListing,
};
