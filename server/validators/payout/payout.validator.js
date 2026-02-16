const { UserValidator } = require("../user");

const { isValidMongoId } = UserValidator;

// Malaysian bank SWIFT/BIC codes mapping
// These are the official SWIFT codes for Malaysian banks used in domestic transfers
const MALAYSIAN_BANKS = {
  MBBEMYKL: "Maybank",
  CIBBMYKL: "CIMB Bank",
  PABORUMYKL: "Public Bank",
  RHBBMYKL: "RHB Bank",
  HLBBMYKL: "Hong Leong Bank",
  AIABORUMYKL: "AmBank",
  BIMBMYKL: "Bank Islam",
  AFBQMYKL: "Affin Bank",
  BKRMMYKL: "Bank Rakyat",
  BMMBMYKL: "Bank Muamalat",
  ALSRMYK1: "Alliance Bank",
  UABORUMYKL: "United Overseas Bank",
  OCBCMYKL: "OCBC Bank",
  HABORUMYKL: "HSBC Bank",
  SCBLMYKX: "Standard Chartered",
  CITIMYKL: "Citibank",
  AABORUMYKL: "Agrobank",
  BSABORUMYKL: "Bank Simpanan Nasional",
};

class PayoutValidator {
  static isValidPayoutAmount(amount, minAmount = 10) {
    return typeof amount === "number" && amount >= minAmount;
  }

  static isValidSchedule(schedule) {
    const validSchedules = ["weekly", "monthly", "manual"];
    return validSchedules.includes(schedule);
  }

  static isValidBankDetails(bankDetails) {
    if (!bankDetails || typeof bankDetails !== "object") return false;
    const { bankName, bankCode, accountNumber, accountHolderName } =
      bankDetails;
    return (
      bankName &&
      typeof bankName === "string" &&
      bankCode &&
      typeof bankCode === "string" &&
      accountNumber &&
      typeof accountNumber === "string" &&
      accountHolderName &&
      typeof accountHolderName === "string"
    );
  }

  static isValidAccountNumber(accountNumber) {
    if (!accountNumber || typeof accountNumber !== "string") return false;
    // Malaysian bank accounts are typically 10-16 digits
    const cleaned = accountNumber.replace(/[\s-]/g, "");
    return /^\d{10,16}$/.test(cleaned);
  }

  static isValidMalaysianBankCode(bankCode) {
    if (!bankCode || typeof bankCode !== "string") return false;
    // Accept valid SWIFT codes (8 or 11 characters) or shorthand codes
    const upperCode = bankCode.toUpperCase().trim();
    // Check if it's a known Malaysian bank SWIFT code
    if (MALAYSIAN_BANKS[upperCode]) return true;
    // Accept SWIFT format (8 or 11 chars, alphanumeric)
    return /^[A-Z]{4}MY[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(upperCode);
  }

  static getMalaysianBanks() {
    return MALAYSIAN_BANKS;
  }

  static getBankNameByCode(code) {
    return MALAYSIAN_BANKS[code?.toUpperCase()] || null;
  }
}

const payoutErrorMessages = {
  payoutId: {
    required: "Payout ID is required",
    invalid: "Invalid payout ID format",
  },
  amount: {
    required: "Payout amount is required",
    minimum: "Payout amount must be at least RM 10",
    belowMinimum: "Amount must be at least RM 10",
    exceedsBalance: "Amount exceeds available balance",
    invalid: "Invalid payout amount",
  },
  schedule: {
    invalid: "Invalid payout schedule. Must be weekly, monthly, or manual",
  },
  bankDetails: {
    required: "Bank details are required",
    invalid: "Invalid bank details format",
    notVerified: "Bank account must be verified before payout",
    bankNameRequired: "Bank name is required",
    bankNameLength: "Bank name must be between 2-100 characters",
    bankCodeRequired: "Bank SWIFT code is required",
    bankCodeInvalid:
      "Invalid bank code. Please use a valid Malaysian bank SWIFT code (e.g., MBBEMYKL for Maybank)",
    accountNumberRequired: "Account number is required",
    accountNumberInvalid:
      "Invalid account number. Malaysian accounts are typically 10-16 digits",
    accountHolderRequired: "Account holder name is required",
    accountHolderLength: "Account holder name must be between 2-200 characters",
  },
  accountNumber: {
    invalid: "Invalid account number format (must be 10-16 digits)",
  },
  balance: {
    notFound: "Seller balance not found",
    insufficient: "Insufficient balance for payout",
  },
  payout: {
    notFound: "Payout not found",
    cannotCancel: "This payout cannot be cancelled",
    alreadyProcessing: "Payout is already being processed",
    invalidStatus: "Invalid payout status filter",
  },
  permission: {
    notOwner: "You can only access your own payout information",
    adminOnly: "This action requires admin privileges",
  },
};

module.exports = { PayoutValidator, payoutErrorMessages };
