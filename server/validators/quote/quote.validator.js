const { UserValidator } = require("../user");

const { isValidMongoId } = UserValidator;

class QuoteValidator {
  static isValidQuoteMessage(message) {
    if (!message || typeof message !== "string") return false;
    const trimmed = message.trim();
    return trimmed.length >= 10 && trimmed.length <= 2000;
  }

  static isValidBudget(budget) {
    if (budget === undefined || budget === null) return true;
    return typeof budget === "number" && budget >= 0;
  }

  static isValidTimeline(timeline) {
    if (!timeline) return true;
    return typeof timeline === "string" && timeline.length <= 200;
  }

  static isValidCustomFieldValues(values) {
    if (!values) return true;
    if (!Array.isArray(values)) return false;

    return values.every((field) => {
      return (
        field.label &&
        typeof field.label === "string" &&
        field.value !== undefined
      );
    });
  }

  static isValidQuotedPrice(price) {
    return typeof price === "number" && price > 0;
  }

  static isValidEstimatedDuration(duration) {
    if (!duration) return true;
    return typeof duration === "string" && duration.length <= 100;
  }

  static isValidSellerMessage(message) {
    if (!message) return true;
    return typeof message === "string" && message.length <= 1000;
  }

  static isValidDepositAmount(amount, totalPrice) {
    if (!amount) return true;
    return typeof amount === "number" && amount > 0 && amount <= totalPrice;
  }

  static isValidDepositPercentage(percentage) {
    if (!percentage) return true;
    return (
      typeof percentage === "number" && percentage > 0 && percentage <= 100
    );
  }

  static isValidTerms(terms) {
    if (!terms) return true;
    return typeof terms === "string" && terms.length <= 500;
  }
}

const quoteErrorMessages = {
  quoteId: {
    required: "Quote ID is required",
    invalid: "Invalid quote ID format",
  },
  listingId: {
    required: "Listing ID is required",
    invalid: "Invalid listing ID format",
    notQuoteBased: "This listing does not accept quote requests",
  },
  message: {
    required: "Request message is required",
    minLength: "Message must be at least 10 characters",
    maxLength: "Message cannot exceed 2000 characters",
  },
  budget: {
    invalid: "Budget must be a positive number",
  },
  timeline: {
    maxLength: "Timeline cannot exceed 200 characters",
  },
  priority: {
    invalid: "Invalid priority level",
  },
  customFieldValues: {
    invalid: "Invalid custom field values format",
  },
  quotedPrice: {
    required: "Quoted price is required",
    invalid: "Quoted price must be a positive number",
  },
  estimatedDuration: {
    maxLength: "Estimated duration cannot exceed 100 characters",
  },
  sellerMessage: {
    maxLength: "Seller message cannot exceed 1000 characters",
  },
  deposit: {
    invalid: "Deposit amount must be positive and less than total price",
    percentageInvalid: "Deposit percentage must be between 0 and 100",
  },
  terms: {
    maxLength: "Terms cannot exceed 500 characters",
  },
  cancelReason: {
    required: "Cancel reason is required",
    invalid: "Invalid cancel reason",
  },
  status: {
    invalid: "Invalid quote status",
    transitionNotAllowed: "This status transition is not allowed",
  },
  permission: {
    notBuyer: "Only the buyer can perform this action",
    notSeller: "Only the seller can perform this action",
    notParticipant: "You are not a participant in this quote",
  },
  quote: {
    notFound: "Quote request not found",
    expired: "This quote has expired",
    alreadyQuoted: "This quote has already been responded to",
    notPending: "Quote is not in pending status",
    notQuoted: "Quote has not been responded to yet",
    notAccepted: "Quote has not been accepted yet",
    cannotCancel: "This quote cannot be cancelled",
  },
};

module.exports = { QuoteValidator, quoteErrorMessages };
