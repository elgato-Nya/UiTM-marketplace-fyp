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
        // Connection pooling for better performance
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
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
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const attemptSend = async (attempt = 1) => {
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
        attempt,
      });
      return result;
    } catch (error) {
      const isConnectionError =
        error.code === "ECONNRESET" ||
        error.code === "ETIMEDOUT" ||
        error.code === "ENOTFOUND" ||
        error.code === "ESOCKET";

      logger.error(
        `Failed to send password reset email (attempt ${attempt}/${MAX_RETRIES}) to ${
          user?.email || "unknown"
        }: ${error.message}`,
        {
          errorCode: error.code,
          isConnectionError,
          willRetry: isConnectionError && attempt < MAX_RETRIES,
        }
      );

      // Retry logic for connection errors
      if (isConnectionError && attempt < MAX_RETRIES) {
        logger.info(
          `Retrying password reset email in ${RETRY_DELAY}ms (attempt ${
            attempt + 1
          }/${MAX_RETRIES})...`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return attemptSend(attempt + 1);
      }

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

      // User-friendly error message for connection/platform errors
      if (isConnectionError) {
        throw new AppError(
          "We're experiencing technical difficulties with our email service. This is not your fault. Please try again in a few minutes or contact support if the issue persists.",
          503,
          "EMAIL_SERVICE_UNAVAILABLE",
          true
        );
      }

      // Otherwise, wrap in generic server error
      createServerError(
        "Failed to send password reset email. Please try again later.",
        "EMAIL_SEND_FAILED"
      );
    }
  };

  return attemptSend();
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
      <p>You've requested to verify your merchant status with your UiTM email. Click the button below to complete verification:</p>
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
          • This email was sent to your UiTM email for verification<br>
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

/**
 * Send admin response notification email to contact submitter
 * @param {Object} contact - Contact submission object
 * @param {String} response - Admin's response message
 * @throws {AppError} Validation or server error
 */
const sendContactResponseEmail = async (contact, response) => {
  try {
    // Validate input parameters
    if (!contact || !contact.submittedBy || !contact.submittedBy.email) {
      createValidationError(
        "Contact submitter email is required",
        [{ field: "contact.submittedBy.email", message: "Email is required" }],
        "INVALID_CONTACT_EMAIL"
      );
    }

    if (!response || typeof response !== "string" || !response.trim()) {
      createValidationError(
        "Admin response message is required",
        [{ field: "response", message: "Response message is required" }],
        "MISSING_RESPONSE_MESSAGE"
      );
    }

    const emailTransporter = initializeTransporter();
    const submitterName = contact.submittedBy.name || "User";
    const submitterEmail = contact.submittedBy.email;

    // Determine the contact type label
    const typeLabels = {
      bug_report: "Bug Report",
      enquiry: "Enquiry",
      feedback: "Feedback",
      collaboration: "Collaboration Request",
      content_report: "Content Report",
    };
    const typeLabel = typeLabels[contact.type] || contact.type;

    // Build email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .response-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
          .submission-details { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; min-width: 120px; color: #666; }
          .detail-value { color: #333; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Response to Your ${typeLabel}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">MarKet Platform</p>
          </div>
          <div class="content">
            <p>Dear ${submitterName},</p>
            <p>Thank you for contacting us. We have reviewed your submission and would like to provide the following response:</p>
            
            <div class="response-box">
              <h3 style="margin-top: 0; color: #667eea;">Admin Response</h3>
              <p style="white-space: pre-wrap; margin: 0;">${response}</p>
            </div>

            <div class="submission-details">
              <h3 style="margin-top: 0; color: #333;">Your Submission Details</h3>
              <div class="detail-row">
                <span class="detail-label">Subject:</span>
                <span class="detail-value">${contact.subject}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${typeLabel}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="text-transform: capitalize;">${
                  contact.status
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Priority:</span>
                <span class="detail-value" style="text-transform: capitalize;">${
                  contact.priority
                }</span>
              </div>
              <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label">Submitted:</span>
                <span class="detail-value">${new Date(
                  contact.createdAt
                ).toLocaleString()}</span>
              </div>
            </div>

            ${
              process.env.CLIENT_URL
                ? `<p style="text-align: center;">
                    <a href="${process.env.CLIENT_URL}/contact" class="button">Contact Us Again</a>
                   </p>`
                : ""
            }

            <p>If you have any further questions or concerns, please don't hesitate to reach out to us again.</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>MarKet Support Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
            <p>&copy; ${new Date().getFullYear()} MarKet Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: submitterEmail,
      subject: `Response to Your ${typeLabel}: ${contact.subject}`,
      html: emailHtml,
    };

    let result;

    // Try SMTP first (unless we know it's blocked)
    if (!smtpBlocked) {
      try {
        const emailTransporter = initializeTransporter();
        result = await emailTransporter.sendMail(mailOptions);
        logger.info(
          `Contact response email sent via SMTP to ${submitterEmail}`,
          {
            messageId: result.messageId,
            contactId: contact._id,
            type: contact.type,
          }
        );
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
          smtpBlocked = true;

          // Fallback to AWS SDK
          result = await sendEmailViaSdk(mailOptions);
          logger.info(
            `Contact response email sent via AWS SDK to ${submitterEmail}`,
            {
              messageId: result.messageId,
              contactId: contact._id,
              type: contact.type,
            }
          );
        } else {
          throw smtpError;
        }
      }
    } else {
      // SMTP is known to be blocked, use AWS SDK directly
      result = await sendEmailViaSdk(mailOptions);
      logger.info(
        `Contact response email sent via AWS SDK to ${submitterEmail}`,
        {
          messageId: result.messageId,
          contactId: contact._id,
          type: contact.type,
        }
      );
    }

    return result;
  } catch (error) {
    logger.error(
      `Failed to send contact response email to ${
        contact?.submittedBy?.email || "unknown"
      }: ${error.message}`,
      {
        contactId: contact?._id,
        type: contact?.type,
      }
    );

    // Check for SES sandbox restriction errors
    if (error.message && error.message.includes("MessageRejected")) {
      logger.error(
        "SES Sandbox Restriction: Email address not verified. Please verify the recipient email in AWS SES Console or request production access.",
        { recipientEmail: contact?.submittedBy?.email }
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
      "Failed to send contact response email",
      "EMAIL_SEND_FAILED"
    );
  }
};

/**
 * Send notification email for critical notification types
 * Called by the notification service when a notification has "email" channel
 * @param {Object} params - { recipientEmail, recipientName, subject, type, title, message, data }
 * @returns {Promise<Object>} Send result
 */
const sendNotificationEmail = async ({
  recipientEmail,
  recipientName,
  subject,
  type,
  title,
  message,
  data = {},
}) => {
  try {
    if (!recipientEmail) {
      logger.warn("Cannot send notification email - no recipient email", {
        type,
      });
      return null;
    }

    const displayName = recipientName || "User";
    const htmlContent = getNotificationEmailTemplate({
      displayName,
      title,
      message,
      type,
      data,
    });

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || "MarKet"} <${process.env.EMAIL_FROM}>`,
      to: recipientEmail,
      subject: subject || title,
      html: htmlContent,
    };

    let result;

    if (!smtpBlocked) {
      try {
        const emailTransporter = initializeTransporter();
        result = await emailTransporter.sendMail(mailOptions);
        logger.info(`Notification email sent via SMTP to ${recipientEmail}`, {
          messageId: result.messageId,
          type,
        });
      } catch (smtpError) {
        if (
          smtpError.code === "ESOCKET" ||
          smtpError.code === "ECONNRESET" ||
          smtpError.code === "ETIMEDOUT"
        ) {
          logger.warn(
            "SMTP blocked for notification email, switching to AWS SDK",
            { error: smtpError.code }
          );
          smtpBlocked = true;
          result = await sendEmailViaSdk(mailOptions);
          logger.info(
            `Notification email sent via AWS SDK to ${recipientEmail}`,
            { messageId: result.messageId, type }
          );
        } else {
          throw smtpError;
        }
      }
    } else {
      result = await sendEmailViaSdk(mailOptions);
      logger.info(
        `Notification email sent via AWS SDK to ${recipientEmail}`,
        { messageId: result.messageId, type }
      );
    }

    return result;
  } catch (error) {
    logger.error(
      `Failed to send notification email to ${recipientEmail}: ${error.message}`,
      { type, title }
    );
    // Don't throw - notification emails should not break the main flow
    return null;
  }
};

/**
 * Generate unified notification email template
 * @param {Object} params - { displayName, title, message, type, data }
 * @returns {String} HTML content
 */
const getNotificationEmailTemplate = ({
  displayName,
  title,
  message,
  type,
  data,
}) => {
  // Type-specific accent colors
  const typeColors = {
    new_order_received: "#28a745",
    order_delivered: "#007bff",
    quote_request_received: "#6f42c1",
    quote_response_received: "#17a2b8",
    password_reset: "#d32f2f",
    security_alert: "#dc3545",
  };

  const typeIcons = {
    new_order_received: "\uD83D\uDECD\uFE0F",
    order_delivered: "\u2705",
    quote_request_received: "\uD83D\uDCAC",
    quote_response_received: "\uD83D\uDCAC",
    password_reset: "\uD83D\uDD10",
    security_alert: "\u26A0\uFE0F",
  };

  const accentColor = typeColors[type] || "#007bff";
  const icon = typeIcons[type] || "\uD83D\uDD14";

  // Build CTA button if applicable
  let ctaHtml = "";
  const clientUrl = process.env.CLIENT_URL || "";

  if (type === "new_order_received" && data.orderId) {
    ctaHtml = `
      <div style="text-align: center; margin: 28px 0;">
        <a href="${clientUrl}/orders/${data.orderId}" style="background: ${accentColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          View Order Details
        </a>
      </div>`;
  } else if (type === "order_delivered" && data.orderId) {
    ctaHtml = `
      <div style="text-align: center; margin: 28px 0;">
        <a href="${clientUrl}/orders/${data.orderId}" style="background: ${accentColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          View Delivery Details
        </a>
      </div>`;
  } else if (
    (type === "quote_request_received" || type === "quote_response_received") &&
    data.quoteId
  ) {
    ctaHtml = `
      <div style="text-align: center; margin: 28px 0;">
        <a href="${clientUrl}/quotes/${data.quoteId}" style="background: ${accentColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          View Quote
        </a>
      </div>`;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #f5f5f5;">
      <div style="background: ${accentColor}; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <div style="font-size: 36px; margin-bottom: 8px;">${icon}</div>
        <h1 style="margin: 0; font-size: 22px;">${title}</h1>
        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">MarKet Platform</p>
      </div>
      <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px;">
        <p style="margin-top: 0;">Hi <strong>${displayName}</strong>,</p>
        <p style="color: #444; line-height: 1.6;">${message}</p>
        ${ctaHtml}
        <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
          This is an automated notification from MarKet. You can manage your notification preferences in your account settings.
        </p>
      </div>
    </div>
  `;
};

/**
 * Send merchant approval email
 * @param {Object} merchant - Merchant user object
 * @param {String} note - Optional admin note
 */
const sendMerchantApprovalEmail = async (merchant, note) => {
  return sendNotificationEmail({
    recipientEmail: merchant.email,
    recipientName:
      merchant.merchantDetails?.shopName ||
      merchant.profile?.username ||
      "Merchant",
    subject: "Your Shop Has Been Verified - MarKet",
    type: "merchant_verified",
    title: "Shop Verified!",
    message: `Congratulations! Your shop "${merchant.merchantDetails?.shopName || "your shop"}" has been verified and is now active on MarKet. You can start listing products and accepting orders.${note ? `<br><br><strong>Admin Note:</strong> ${note}` : ""}`,
    data: { shopName: merchant.merchantDetails?.shopName },
  });
};

/**
 * Send merchant rejection email
 * @param {Object} merchant - Merchant user object
 * @param {String} reason - Rejection reason
 */
const sendMerchantRejectionEmail = async (merchant, reason) => {
  return sendNotificationEmail({
    recipientEmail: merchant.email,
    recipientName:
      merchant.profile?.username || "Merchant",
    subject: "Verification Update - MarKet",
    type: "merchant_rejected",
    title: "Verification Not Approved",
    message: `We've reviewed your shop verification request and unfortunately it was not approved at this time.<br><br><strong>Reason:</strong> ${reason}<br><br>Please review the requirements and consider resubmitting your verification.`,
    data: { shopName: merchant.merchantDetails?.shopName, reason },
  });
};

/**
 * Send merchant suspension email
 * @param {Object} merchant - Merchant user object
 * @param {String} reason - Suspension reason
 */
const sendMerchantSuspensionEmail = async (merchant, reason) => {
  return sendNotificationEmail({
    recipientEmail: merchant.email,
    recipientName:
      merchant.profile?.username || "Merchant",
    subject: "Account Suspended - MarKet",
    type: "security_alert",
    title: "Account Suspended",
    message: `Your shop "${merchant.merchantDetails?.shopName || "your shop"}" has been suspended.<br><br><strong>Reason:</strong> ${reason}<br><br>If you believe this is a mistake, please contact our support team for assistance.`,
    data: { shopName: merchant.merchantDetails?.shopName, reason },
  });
};

/**
 * Send merchant reactivation email
 * @param {Object} merchant - Merchant user object
 */
const sendMerchantReactivationEmail = async (merchant) => {
  return sendNotificationEmail({
    recipientEmail: merchant.email,
    recipientName:
      merchant.merchantDetails?.shopName ||
      merchant.profile?.username ||
      "Merchant",
    subject: "Account Reactivated - MarKet",
    type: "merchant_verified",
    title: "Account Reactivated",
    message: `Great news! Your shop "${merchant.merchantDetails?.shopName || "your shop"}" has been reactivated. You can now resume listing products and accepting orders on MarKet.`,
    data: { shopName: merchant.merchantDetails?.shopName },
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMerchantVerificationEmail,
  sendContactResponseEmail,
  sendNotificationEmail,
  sendMerchantApprovalEmail,
  sendMerchantRejectionEmail,
  sendMerchantSuspensionEmail,
  sendMerchantReactivationEmail,
  initializeTransporter,
  testConnection,
  handleSesError,
  getSendingStats,
  isSandboxMode,
};
