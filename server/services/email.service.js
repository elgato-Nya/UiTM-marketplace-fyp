const nodemailer = require("nodemailer");
const {
  AppError,
  createServerError,
  createValidationError,
} = require("../utils/errors");
const logger = require("../utils/logger");
const {
  sendEmailViaSdk,
  testSdkConnection,
} = require("./email.aws-sdk.service");

// Flag to track if SMTP is blocked (network restriction)
let smtpBlocked = false;

// AWS SES specific configuration
const SES_REGIONS = {
  "us-east-1": "email-smtp.us-east-1.amazonaws.com",
  "us-west-2": "email-smtp.us-west-2.amazonaws.com",
  "eu-west-1": "email-smtp.eu-west-1.amazonaws.com",
  "ap-southeast-1": "email-smtp.ap-southeast-1.amazonaws.com",
};

// Create transporter instance
let transporter = null;

/**
 * Initialize email transporter
 * @returns {Object} Nodemailer transporter instance
 */
const initializeTransporter = () => {
  try {
    // Force recreation if transporter exists (for development/testing)
    // In production, this will only run once
    if (!transporter || process.env.NODE_ENV === "development") {
      // Validate required environment variables
      const requiredEnvVars = [
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASS",
        "EMAIL_FROM",
        "EMAIL_FROM_NAME",
      ];
      const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName]
      );

      if (missingVars.length > 0) {
        throw createValidationError(
          `Missing required environment variables: ${missingVars.join(", ")}`,
          missingVars.map((varName) => ({
            field: varName,
            message: "Required environment variable",
          })),
          "MISSING_EMAIL_CONFIG"
        );
      }

      // AWS SES specific configuration
      const config = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // CRITICAL FIX: AWS SES rejects EHLO with localhost/127.0.0.1
        // Must provide a valid hostname for production mode
        name: "nekodez.com",
        tls: {
          // Allow connections even if certificate doesn't match hostname
          rejectUnauthorized: false,
        },
      };

      // Add AWS SES specific settings for better performance
      const isAwsSes =
        process.env.SMTP_HOST &&
        (process.env.SMTP_HOST.includes("amazonaws.com") ||
          process.env.SMTP_HOST.includes("amazonses.com"));

      if (isAwsSes) {
        config.connectionTimeout = 60000; // 60 seconds
        config.greetingTimeout = 30000; // 30 seconds
        config.socketTimeout = 60000; // 60 seconds
        config.maxConnections = 5; // Connection pooling
        config.maxMessages = 100; // Messages per connection
        config.rateLimit = 14; // Messages per second (SES limit is 14/sec by default)

        logger.info("AWS SES specific configuration applied", {
          host: process.env.SMTP_HOST,
        });
      }

      transporter = nodemailer.createTransport(config);

      logger.info("Email transporter initialized successfully", {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        isAwsSes,
      });
    }
    return transporter;
  } catch (error) {
    logger.error(`Failed to initialize email transporter: ${error.message}`);
    throw error;
  }
};

/**
 * Send verification email to user
 * @param {Object} user - User object with email and profile
 * @param {String} token - Verification token
 * @throws {AppError} Validation or server error
 */
const sendVerificationEmail = async (user, token) => {
  try {
    // Validate input parameters
    if (!user || !user.email) {
      createValidationError(
        "User email is required",
        [{ field: "user.email", message: "Email is required" }],
        "INVALID_USER_EMAIL"
      );
    }

    if (!token) {
      createValidationError(
        "Verification token is required",
        [{ field: "token", message: "Token is required" }],
        "MISSING_VERIFICATION_TOKEN"
      );
    }

    if (!process.env.CLIENT_URL) {
      createValidationError(
        "CLIENT_URL environment variable is required",
        [{ field: "CLIENT_URL", message: "Required for verification URL" }],
        "MISSING_CLIENT_URL"
      );
    }

    const emailTransporter = initializeTransporter();
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}&email=${user.email}`;

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "Verify Your Email - MarKet",
      html: getVerificationTemplate(user, verificationUrl),
    };

    let result;

    // Try SMTP first (unless we know it's blocked)
    if (!smtpBlocked) {
      try {
        const emailTransporter = initializeTransporter();
        result = await emailTransporter.sendMail(mailOptions);
        logger.info(`Verification email sent via SMTP to ${user.email}`, {
          messageId: result.messageId,
        });
      } catch (smtpError) {
        // Check if error is network-related (SMTP blocked)
        if (
          smtpError.code === "ESOCKET" ||
          smtpError.code === "ECONNRESET" ||
          smtpError.code === "ETIMEDOUT"
        ) {
          logger.warn("SMTP blocked, switching to AWS SDK permanently", {
            error: smtpError.code,
          });
          smtpBlocked = true; // Remember for future requests

          // Fallback to AWS SDK
          result = await sendEmailViaSdk(mailOptions);
          logger.info(`Verification email sent via AWS SDK to ${user.email}`, {
            messageId: result.messageId,
          });
        } else {
          throw smtpError; // Re-throw non-network errors
        }
      }
    } else {
      // SMTP is known to be blocked, use AWS SDK directly
      result = await sendEmailViaSdk(mailOptions);
      logger.info(`Verification email sent via AWS SDK to ${user.email}`, {
        messageId: result.messageId,
      });
    }
  } catch (error) {
    logger.error(
      `Failed to send verification email to ${user?.email || "unknown"}: ${
        error.message
      }`
    );

    // Check for SES sandbox restriction errors
    if (error.message && error.message.includes("MessageRejected")) {
      logger.error(
        "SES Sandbox Restriction: Email address not verified. Please verify the recipient email in AWS SES Console or request production access.",
        { recipientEmail: user?.email }
      );
    }

    // If it's already an AppError, re-throw it
    if (error.isOperational) {
      throw new AppError(
        error.message,
        error.statusCode,
        error.errorCode,
        error.isOperational
      );
    }

    // Otherwise, wrap in server error
    createServerError("Failed to send verification email", "EMAIL_SEND_FAILED");
  }
};

/**
 * Send merchant verification email to UiTM email
 * @param {Object} user - User object with email and profile
 * @param {String} verificationEmail - UiTM email address to verify
 * @param {String} token - Verification token
 * @throws {AppError} Validation or server error
 */
const sendMerchantVerificationEmail = async (
  user,
  verificationEmail,
  token
) => {
  try {
    // Validate input parameters
    if (!user || !user.email) {
      createValidationError(
        "User information is required",
        [{ field: "user", message: "User object is required" }],
        "INVALID_USER"
      );
    }

    if (!verificationEmail) {
      createValidationError(
        "Verification email is required",
        [{ field: "verificationEmail", message: "Email is required" }],
        "MISSING_VERIFICATION_EMAIL"
      );
    }

    if (!token) {
      createValidationError(
        "Verification token is required",
        [{ field: "token", message: "Token is required" }],
        "MISSING_VERIFICATION_TOKEN"
      );
    }

    if (!process.env.CLIENT_URL) {
      createValidationError(
        "CLIENT_URL environment variable is required",
        [{ field: "CLIENT_URL", message: "Required for verification URL" }],
        "MISSING_CLIENT_URL"
      );
    }

    const emailTransporter = initializeTransporter();
    const verificationUrl = `${process.env.CLIENT_URL}/merchant/verify-email?token=${token}&userId=${user._id}`;

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: verificationEmail,
      subject: "Verify Your Merchant Status - MarKet",
      html: getMerchantVerificationTemplate(user, verificationUrl),
    };

    const result = await emailTransporter.sendMail(mailOptions);
    logger.info(
      `Merchant verification email sent successfully to ${verificationEmail}`,
      {
        userId: user._id,
        messageId: result.messageId,
        response: result.response,
        accepted: result.accepted,
        rejected: result.rejected,
      }
    );

    return {
      success: true,
      messageId: result.messageId,
      verificationEmail,
    };
  } catch (error) {
    logger.error(
      `Failed to send merchant verification email to ${
        verificationEmail || "unknown"
      }: ${error.message}`
    );

    // Check for SES sandbox restriction errors
    if (error.message && error.message.includes("MessageRejected")) {
      logger.error(
        "SES Sandbox Restriction: Email address not verified. Please verify the recipient email in AWS SES Console or request production access.",
        { recipientEmail: verificationEmail }
      );
    }

    // If it's already an AppError, re-throw it
    if (error.isOperational) {
      throw new AppError(
        error.message,
        error.statusCode,
        error.errorCode,
        error.isOperational
      );
    }

    // Otherwise, wrap in server error
    createServerError(
      "Failed to send merchant verification email",
      "EMAIL_SEND_FAILED"
    );
  }
};

/**
 * Send password reset email to user
 * @param {Object} user - User object with email and profile
 * @param {String} token - Reset token
 * @throws {AppError} Validation or server error
 */
const sendPasswordResetEmail = async (user, token) => {
  try {
    // Validate input parameters
    if (!user || !user.email) {
      createValidationError(
        "User email is required",
        [{ field: "user.email", message: "Email is required" }],
        "INVALID_USER_EMAIL"
      );
    }

    if (!token) {
      createValidationError(
        "Reset token is required",
        [{ field: "token", message: "Token is required" }],
        "MISSING_RESET_TOKEN"
      );
    }

    if (!process.env.CLIENT_URL) {
      createValidationError(
        "CLIENT_URL environment variable is required",
        [{ field: "CLIENT_URL", message: "Required for reset URL" }],
        "MISSING_CLIENT_URL"
      );
    }

    const emailTransporter = initializeTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${user.email}`;

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "Password Reset - MarKet",
      html: getPasswordResetTemplate(user, resetUrl),
    };

    const result = await emailTransporter.sendMail(mailOptions);
    logger.info(`Password reset email sent successfully to ${user.email}`, {
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
      rejected: result.rejected,
    });
  } catch (error) {
    logger.error(
      `Failed to send password reset email to ${user?.email || "unknown"}: ${
        error.message
      }`
    );

    // Check for SES sandbox restriction errors
    if (error.message && error.message.includes("MessageRejected")) {
      logger.error(
        "SES Sandbox Restriction: Email address not verified. Please verify the recipient email in AWS SES Console or request production access.",
        { recipientEmail: user?.email }
      );
    }

    // If it's already an AppError, re-throw it
    if (error.isOperational) {
      throw new AppError(
        error.message,
        error.statusCode,
        error.errorCode,
        error.isOperational
      );
    }

    // Otherwise, wrap in server error
    createServerError(
      "Failed to send password reset email",
      "EMAIL_SEND_FAILED"
    );
  }
};

/**
 * Generate verification email template
 * @param {Object} user - User object
 * @param {String} url - Verification URL
 * @returns {String} HTML template
 */
const getVerificationTemplate = (user, url) => {
  const username = user?.profile?.username || "User";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #007bff; margin: 0;">MarKet</h1>
      </div>
      <h2 style="color: #333;">Email Verification</h2>
      <p>Hi <strong>${username}</strong>,</p>
      <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" aria-label="Verify Email" style="background: #007bff; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link in your browser:<br>
        <a href="${url}" style="color: #1976d2; word-break: break-all;">${url}</a>
      </p>
      <div style="background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 4px; padding: 12px; margin: 20px 0;">
        <p style="margin: 0; color: #1565c0;">
          <strong>Note:</strong> This link expires in <strong>24 hours</strong>.<br>
          If you didn't create this account, please ignore this email.
        </p>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated message from MarKet. Please do not reply to this email.
      </p>
    </div>
  `;
};

/**
 * Generate merchant verification email template
 * @param {Object} user - User object
 * @param {String} url - Verification URL
 * @returns {String} HTML template
 */
const getMerchantVerificationTemplate = (user, url) => {
  const username = user?.profile?.username || "Merchant";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #007bff; margin: 0;">MarKet</h1>
      </div>
      <h2 style="color: #333;">Merchant Verification</h2>
      <p>Hi <strong>${username}</strong>,</p>
      <p>You've requested to verify your merchant status with your email. Click the button below to complete verification:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" aria-label="Verify Merchant Status" style="background: #28a745; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Verify Merchant Status
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link in your browser:<br>
        <a href="${url}" style="color: #1976d2; word-break: break-all;">${url}</a>
      </p>
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 12px; margin: 20px 0;">
        <p style="margin: 0; color: #155724;">
          <strong>✓ What happens after verification:</strong><br>
          • You'll gain permanent merchant status<br>
          • You can list products on the marketplace<br>
          • Your shop will be visible to customers<br>
          • Merchant status remains even after graduation
        </p>
      </div>
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 12px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">
          <strong>⚠️ Important:</strong><br>
          • This link expires in <strong>24 hours</strong><br>
          • This email was sent to your email for verification<br>
          • If you didn't request this, please ignore this email
        </p>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated message from MarKet. Please do not reply to this email.
      </p>
    </div>
  `;
};

/**
 * Generate password reset email template
 * @param {Object} user - User object
 * @param {String} url - Reset URL
 * @returns {String} HTML template
 */
const getPasswordResetTemplate = (user, resetUrl) => {
  const username = user?.profile?.username || "User";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin: 0;">MarKet</h1>
      </div>
      
      <h2 style="color: #d32f2f;">Password Reset Request</h2>
      
      <p>Hi <strong>${username}</strong>,</p>
      
      <p>We received a request to reset your password for your MarKet account.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #d32f2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Reset My Password
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link in your browser:<br>
        <a href="${resetUrl}" style="color: #1976d2; word-break: break-all;">${resetUrl}</a>
      </p>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">
          <strong>⚠️ Security Notice:</strong><br>
          • This link expires in <strong>15 minutes</strong> for your security<br>
          • If you didn't request this reset, please ignore this email<br>
          • Your password won't change until you click the link above
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #666; font-size: 12px; text-align: center;">
        This is an automated message from MarKet. Please do not reply to this email.
      </p>
    </div>
  `;
};

/**
 * Test email service connection
 * @returns {Promise<Boolean>} Connection status
 */
const testConnection = async () => {
  try {
    const emailTransporter = initializeTransporter();
    await emailTransporter.verify();
    logger.info("Email service connection verified successfully");
    return true;
  } catch (error) {
    logger.error(`Email service connection failed: ${error.message}`);
    return false;
  }
};

/**
 * Handle AWS SES specific errors
 * @param {Error} error - Original error
 * @returns {Object} Processed error information
 */
const handleSesError = (error) => {
  const sesErrors = {
    MessageRejected: "Email was rejected by SES. Check sender reputation.",
    MailFromDomainNotVerified: "Sender domain is not verified in SES.",
    ConfigurationSetDoesNotExist: "SES configuration set not found.",
    AccountSendingPaused: "SES account is in sandbox mode or paused.",
    Throttling: "SES rate limit exceeded. Reduce sending rate.",
    InvalidParameterValue: "Invalid email address or content.",
  };

  const errorCode = error.code || error.message;
  const knownError = Object.keys(sesErrors).find((key) =>
    errorCode.includes(key)
  );

  if (knownError) {
    logger.warn(`AWS SES Error: ${knownError}`, {
      originalError: error.message,
      suggestion: sesErrors[knownError],
      errorCode: error.code,
    });

    return {
      isAwsError: true,
      errorType: knownError,
      suggestion: sesErrors[knownError],
      originalMessage: error.message,
    };
  }

  return {
    isAwsError: false,
    originalMessage: error.message,
  };
};

/**
 * Get AWS SES sending statistics (for monitoring)
 * @returns {Promise<Object>} SES statistics
 */
const getSendingStats = async () => {
  // This would require AWS SDK integration
  // For now, return basic stats from logs
  try {
    logger.info("Retrieving SES sending statistics");

    return {
      timestamp: new Date(),
      note: "Install AWS SDK for detailed statistics",
      suggestion: "Monitor via AWS CloudWatch for production metrics",
    };
  } catch (error) {
    logger.error("Failed to get SES statistics", error);
    return null;
  }
};

/**
 * Check if email is in SES sandbox mode
 * @returns {Boolean} True if likely in sandbox mode
 */
const isSandboxMode = () => {
  // In sandbox mode, you can only send to verified emails
  const indicators = [
    !process.env.SES_PRODUCTION_MODE,
    process.env.NODE_ENV === "development",
  ];

  return indicators.some(Boolean);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMerchantVerificationEmail,
  initializeTransporter,
  testConnection,
  handleSesError,
  getSendingStats,
  isSandboxMode,
};
