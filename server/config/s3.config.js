const { S3Client } = require("@aws-sdk/client-s3");
const AppError = require("../utils/errors/AppError");

// TODO: try to do this in every file that uses env variables
const requiredEnvVars = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET_NAME",
];

// Skip AWS validation in test environment
// Tests should mock S3 or use fake credentials
if (process.env.NODE_ENV !== "test") {
  // TODO: create a custom env error
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new AppError(
        `Environment variable ${varName} is required but not set.`
      );
    }
  });
}

// Use fake credentials in test environment
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test-access-key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test-secret-key",
  },
  maxAttempts: 3, // Retry up to 3 times
  requestHandler: {
    requestTimeout: 120000, // 120 seconds timeout for S3 operations
    httpsAgent: {
      maxSockets: 50, // Allow more concurrent connections
    },
  },
});

const s3Config = {
  client: s3Client,
  bucketName: process.env.AWS_S3_BUCKET_NAME || "test-bucket",
  region: process.env.AWS_REGION || "ap-southeast-1",

  // Environment-based prefix to separate dev/prod files
  // COMMENTED OUT to prevent breaking changes
  // Once you fix your frontend to use proper subfolders, uncomment this
  // envPrefix: process.env.NODE_ENV === "production" ? "prod/" : "dev/",
  envPrefix: "", // Empty for now - all images stay at root level

  // Folder structure within the bucket
  folders: {
    listings: "listings/", // Products and Services images
    profiles: "profiles/", // User profile pictures
    shops: "shops/", // Shop logos and banners
    reviews: "reviews/", // User reviews
    reports: "reports/", // User reports
    documents: "documents/", // Verification documents
    contact: "contact/", // Contact form images (bug screenshots, feedback images)
  },

  // Image constraints
  maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024, // 5MB default
  allowedImageTypes: (
    process.env.ALLOWED_IMAGE_TYPES ||
    "image/jpeg,image/png,image/webp,image/jpg"
  ).split(","),

  // Image processing settings
  imageQuality: 80, // Compression quality
  maxWidth: 1200, // Max width for resizing
  maxHeight: 1200, // Max height for resizing
  thumbnailWidth: 300, // Thumbnail width
  thumbnailHeight: 300, // Thumbnail height
};

module.exports = { s3Client, s3Config };
