const {
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
} = require("./quote.service");

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
