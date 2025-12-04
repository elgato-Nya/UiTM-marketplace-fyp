const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const logger = require("../utils/logger");
const { createServerError } = require("../utils/errors");

// Initialize AWS SES Client
let sesClient = null;

/**
 * Initialize AWS SES Client
 * @returns {SESClient} AWS SES Client instance
 */
const initializeSESClient = () => {
  if (!sesClient) {
    sesClient = new SESClient({
      region:
        process.env.SES_REGION || process.env.AWS_REGION || "ap-southeast-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    logger.info("AWS SES Client initialized successfully", {
      region: process.env.SES_REGION || process.env.AWS_REGION,
    });
  }
  return sesClient;
};

/**
 * Send email using AWS SDK (bypasses SMTP - uses HTTPS)
 * @param {Object} mailOptions - Email options
 * @param {String} mailOptions.from - Sender email
 * @param {String} mailOptions.to - Recipient email
 * @param {String} mailOptions.subject - Email subject
 * @param {String} mailOptions.html - HTML body
 * @param {String} mailOptions.text - Plain text body (optional)
 * @returns {Promise<Object>} Send result
 */
const sendEmailViaSdk = async (mailOptions) => {
  try {
    const client = initializeSESClient();

    const params = {
      Source: mailOptions.from,
      Destination: {
        ToAddresses: Array.isArray(mailOptions.to)
          ? mailOptions.to
          : [mailOptions.to],
      },
      Message: {
        Subject: {
          Data: mailOptions.subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: mailOptions.html,
            Charset: "UTF-8",
          },
          ...(mailOptions.text && {
            Text: {
              Data: mailOptions.text,
              Charset: "UTF-8",
            },
          }),
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await client.send(command);

    logger.info("Email sent successfully via AWS SDK", {
      messageId: result.MessageId,
      to: mailOptions.to,
    });

    return {
      messageId: result.MessageId,
      accepted: [mailOptions.to],
      rejected: [],
      response: "250 Message accepted",
    };
  } catch (error) {
    logger.error("Failed to send email via AWS SDK", {
      error: error.message,
      to: mailOptions.to,
    });
    throw error;
  }
};

/**
 * Test AWS SDK connection
 * @returns {Promise<Boolean>} Connection status
 */
const testSdkConnection = async () => {
  try {
    initializeSESClient();
    logger.info("AWS SDK connection test passed");
    return true;
  } catch (error) {
    logger.error(`AWS SDK connection test failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendEmailViaSdk,
  testSdkConnection,
  initializeSESClient,
};
