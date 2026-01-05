/**
 * Error Messages Constants
 *
 * PURPOSE: Centralized user-friendly error messages
 * USAGE: Import in error handling utilities and components
 *
 * ORGANIZATION:
 * - Grouped by error category
 * - Each category has common error scenarios
 * - Messages are clear, actionable, and non-technical
 */

/**
 * User-Friendly Error Messages by Category
 */
export const ERROR_MESSAGES = {
  // ==================== NETWORK ERRORS ====================
  network: {
    noConnection:
      "Unable to connect to the server. Please check your internet connection and try again.",
    connectionInterrupted:
      "Your connection was interrupted. Please check your network and try again.",
    timeout:
      "The request took too long to complete. Please try again in a moment.",
    serverUnreachable:
      "Unable to reach our servers. Please check your internet connection.",
    connectionRefused:
      "Unable to connect to the server. The service may be temporarily unavailable.",
    default:
      "A network error occurred. Please check your connection and try again.",
  },

  // ==================== AUTHENTICATION ERRORS ====================
  auth: {
    default: "Authentication failed. Please try logging in again.",
    invalidCredentials:
      "Invalid email or password. Please check your credentials and try again.",
    invalidToken: "Your session is invalid. Please log in again.",
    sessionExpired:
      "Your session has expired. Please log in again to continue.",
    noPermission:
      "You don't have permission to perform this action. Please contact support if you believe this is an error.",
    accountLocked:
      "Your account has been temporarily locked. Please try again later or contact support.",
    accountNotVerified:
      "Please verify your email address before logging in. Check your inbox for the verification email.",
    accountSuspended:
      "Your account has been suspended. Please contact support for assistance.",
    loginRequired: "Please log in to access this feature.",
    passwordMismatch:
      "The passwords you entered don't match. Please try again.",
    weakPassword:
      "Your password doesn't meet the security requirements. Please use a stronger password.",
  },

  // ==================== VALIDATION ERRORS ====================
  validation: {
    default: "Please check your input and try again.",
    requiredField: "This field is required.",
    invalidFormat: "Please enter a valid format.",
    invalidEmail: "Please enter a valid email address.",
    invalidPhone:
      "Please enter a valid Malaysian phone number (starting with 0, 10-11 digits).",
    invalidUsername:
      "Username must be 6-16 characters, start with a letter or number, and contain only letters, numbers, underscores, or hyphens.",
    invalidPassword:
      "Password must be 8-24 characters with at least one uppercase letter, one lowercase letter, and one number.",
    duplicateEmail:
      "This email is already registered. Please use a different email or try logging in.",
    duplicateUsername:
      "This username is already taken. Please choose a different one.",
    duplicatePhone:
      "This phone number is already registered to another account.",
    fileTooLarge: "The file is too large. Please upload a smaller file.",
    invalidFileType:
      "This file type is not supported. Please upload a valid file.",
    maxFilesExceeded: "You've exceeded the maximum number of files allowed.",
  },

  // ==================== NOT FOUND ERRORS ====================
  notFound: {
    default: "The requested resource could not be found.",
    user: "User not found. They may have deleted their account.",
    listing: "This listing is no longer available.",
    order:
      "Order not found. It may have been deleted or you may not have access.",
    shop: "Shop not found. It may have been closed or renamed.",
    page: "The page you're looking for doesn't exist.",
    address: "Address not found. It may have been removed.",
    cart: "Your cart is empty or the items are no longer available.",
  },

  // ==================== RATE LIMIT ERRORS ====================
  rateLimit: {
    default: "Too many requests. Please wait a moment before trying again.",
    login:
      "Too many login attempts. Please wait a few minutes before trying again.",
    email:
      "Email rate limit reached. Please wait a few minutes before requesting another email.",
    api: "You're making requests too quickly. Please slow down and try again.",
  },

  // ==================== SERVER ERRORS ====================
  server: {
    default:
      "Something went wrong on our end. Please try again later. If the problem persists, contact support.",
    maintenance:
      "We're currently undergoing maintenance. Please try again in a few minutes.",
    overloaded:
      "Our servers are experiencing high traffic. Please try again in a moment.",
    database:
      "We're having trouble accessing our data. Please try again in a moment.",
  },

  // ==================== EMAIL SERVICE ERRORS ====================
  email: {
    sendFailed:
      "We couldn't send the email. Please try again or contact support if the problem persists.",
    invalidRecipient:
      "The email address appears to be invalid. Please check and try again.",
    verificationFailed:
      "We couldn't send the verification email. Please try again or use a different email address.",
    resetFailed: "We couldn't send the password reset email. Please try again.",
    alreadySent:
      "We've already sent an email. Please check your inbox (and spam folder) or wait a few minutes before requesting another.",
  },

  // ==================== PAYMENT ERRORS ====================
  payment: {
    default:
      "Payment failed. Please try again or use a different payment method.",
    cardDeclined:
      "Your card was declined. Please try a different card or contact your bank.",
    insufficientFunds:
      "Insufficient funds. Please try a different payment method.",
    invalidCard:
      "Invalid card details. Please check your card information and try again.",
    expired: "Your card has expired. Please use a different card.",
    processingError:
      "We couldn't process your payment. Please try again or use a different method.",
    stripeNotLoaded:
      "Payment system is not ready. Please refresh the page and try again.",
  },

  // ==================== CHECKOUT ERRORS ====================
  checkout: {
    noAddress: "Please select a delivery address before continuing.",
    noDeliveryMethod: "Please select a delivery method.",
    noPaymentMethod: "Please select a payment method.",
    cartEmpty: "Your cart is empty. Add items before checking out.",
    itemsUnavailable:
      "Some items in your cart are no longer available. Please review your cart.",
    priceChanged:
      "Prices have changed since you added items to your cart. Please review before continuing.",
    sessionExpired: "Your checkout session has expired. Please try again.",
    codLimit: "Cash on Delivery is not available for orders over this amount.",
  },

  // ==================== LISTING ERRORS ====================
  listing: {
    createFailed:
      "Failed to create listing. Please check your input and try again.",
    updateFailed: "Failed to update listing. Please try again.",
    deleteFailed: "Failed to delete listing. Please try again.",
    outOfStock: "This item is currently out of stock.",
    inactive: "This listing is no longer active.",
    notAuthorized: "You don't have permission to modify this listing.",
  },

  // ==================== ORDER ERRORS ====================
  order: {
    createFailed: "Failed to place order. Please try again.",
    updateFailed: "Failed to update order. Please try again.",
    cancelFailed: "Failed to cancel order. Please contact support.",
    alreadyShipped:
      "This order has already been shipped and cannot be modified.",
    alreadyCancelled: "This order has already been cancelled.",
  },

  // ==================== UPLOAD ERRORS ====================
  upload: {
    failed: "File upload failed. Please try again.",
    tooLarge: "File is too large. Maximum size is 5MB.",
    invalidType: "Invalid file type. Please upload a valid image file.",
    tooMany: "Too many files. Maximum 10 images allowed.",
  },

  // ==================== WISHLIST ERRORS ====================
  wishlist: {
    addFailed: "Failed to add item to wishlist. Please try again.",
    removeFailed: "Failed to remove item from wishlist. Please try again.",
    alreadyExists: "This item is already in your wishlist.",
  },

  // ==================== CART ERRORS ====================
  cart: {
    addFailed: "Failed to add item to cart. Please try again.",
    updateFailed: "Failed to update cart. Please try again.",
    removeFailed: "Failed to remove item from cart. Please try again.",
    stockExceeded: "Sorry, there isn't enough stock available.",
    itemUnavailable: "This item is no longer available.",
  },

  // ==================== CONTACT ERRORS ====================
  contact: {
    submitFailed: "Failed to submit your message. Please try again.",
    invalidCaptcha: "Please complete the captcha verification.",
  },

  // ==================== MERCHANT ERRORS ====================
  merchant: {
    verificationFailed:
      "Merchant verification failed. Please check your UiTM email and try again.",
    invalidUiTMEmail:
      "Please provide a valid UiTM email address for verification.",
    alreadyVerified: "You're already verified as a merchant.",
    shopUpdateFailed: "Failed to update shop details. Please try again.",
  },

  // ==================== PROFILE ERRORS ====================
  profile: {
    updateFailed: "Failed to update profile. Please try again.",
    fetchFailed: "Failed to load profile. Please refresh the page.",
    avatarUploadFailed: "Failed to upload profile picture. Please try again.",
  },

  // ==================== ADDRESS ERRORS ====================
  address: {
    createFailed: "Failed to add address. Please try again.",
    updateFailed: "Failed to update address. Please try again.",
    deleteFailed: "Failed to delete address. Please try again.",
    setDefaultFailed: "Failed to set default address. Please try again.",
    maxAddresses: "You've reached the maximum number of addresses allowed.",
  },

  // ==================== UNKNOWN/GENERIC ERRORS ====================
  unknown: {
    default: "An unexpected error occurred. Please try again.",
    unexpected: "Something went wrong. Please try again or contact support.",
  },
};

/**
 * Actionable Hints for Common Error Situations
 */
export const ERROR_HINTS = {
  // Network hints
  network: "Try refreshing the page or checking your internet connection.",

  // Authentication hints
  authentication: "You may need to log in again to continue.",
  INVALID_TOKEN: "Please log out and log in again.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  SESSION_EXPIRED: "Please log in again to continue.",

  // Validation hints
  VALIDATION_ERROR:
    "Please review the highlighted fields and correct any errors.",
  DUPLICATE_FIELD:
    "This value is already in use. Please choose a different one.",

  // Rate limit hints
  rateLimit: "Please wait a few minutes before trying again.",
  RATE_LIMITED: "You can request another email in 5 minutes.",

  // Server hints
  server: "If this problem persists, please contact our support team.",

  // Payment hints
  CARD_DECLINED: "Try using a different payment method or contact your bank.",
  PAYMENT_FAILED: "Please check your payment details and try again.",

  // File upload hints
  FILE_TOO_LARGE: "Try compressing your image or using a smaller file.",
  INVALID_FILE_TYPE: "Supported formats: JPG, PNG, GIF, WebP.",

  // Email hints
  EMAIL_SEND_FAILED: "Check your email address or try again later.",
  EMAIL_RATE_LIMITED:
    "Check your inbox (and spam folder) for the previous email.",

  // Checkout hints
  CHECKOUT_EXPIRED: "Add your items to cart again and proceed to checkout.",
  STOCK_EXCEEDED: "Reduce the quantity or check back later.",
};

/**
 * Success Messages by Category
 */
export const SUCCESS_MESSAGES = {
  auth: {
    login: "Welcome back! You've successfully logged in.",
    register:
      "Account created successfully! Please check your email to verify your account.",
    logout: "You've been logged out successfully.",
    passwordReset: "Password reset email sent! Check your inbox.",
    passwordChanged: "Your password has been changed successfully.",
    emailVerified: "Your email has been verified successfully!",
  },
  profile: {
    updated: "Profile updated successfully!",
    avatarUpdated: "Profile picture updated successfully!",
  },
  address: {
    created: "Address added successfully!",
    updated: "Address updated successfully!",
    deleted: "Address removed successfully.",
    defaultSet: "Default address updated!",
  },
  listing: {
    created: "Listing created successfully!",
    updated: "Listing updated successfully!",
    deleted: "Listing deleted successfully.",
    published: "Listing is now live!",
    unpublished: "Listing has been unpublished.",
  },
  order: {
    created: "Order placed successfully!",
    updated: "Order updated successfully!",
    cancelled: "Order cancelled successfully.",
    shipped: "Order marked as shipped!",
    delivered: "Order marked as delivered!",
  },
  cart: {
    added: "Item added to cart!",
    updated: "Cart updated!",
    removed: "Item removed from cart.",
    cleared: "Cart cleared.",
  },
  wishlist: {
    added: "Added to wishlist!",
    removed: "Removed from wishlist.",
  },
  contact: {
    submitted: "Thank you! Your message has been sent successfully.",
  },
  merchant: {
    verificationSent: "Verification email sent! Check your UiTM inbox.",
    verified: "Congratulations! You're now a verified merchant.",
    shopUpdated: "Shop details updated successfully!",
  },
  upload: {
    success: "File uploaded successfully!",
    deleted: "File deleted successfully.",
  },
};

export default {
  ERROR_MESSAGES,
  ERROR_HINTS,
  SUCCESS_MESSAGES,
};
