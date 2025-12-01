/**
 * S3 Service - Upload/Delete files to AWS S3
 */

const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const path = require("path");

const { s3Config, s3Client } = require("../../config/s3.config");
const { createServerError } = require("../../utils/errors");
const logger = require("../../utils/logger");

const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString("hex");
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);

  const sanitizedBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 30); // limit length

  return `${timestamp}-${randomBytes}-${sanitizedBaseName}${extension}`;
};

const generateKey = (folder, subfolder, fileName) => {
  // Add environment prefix (dev/ or prod/)
  const envPrefix = s3Config.envPrefix || "";

  if (subfolder) {
    return `${envPrefix}${folder}${subfolder}/${fileName}`;
  }
  return `${envPrefix}${folder}${fileName}`;
};

const uploadFile = async (
  fileBuffer,
  originalName,
  MimeType,
  folder,
  subfolder = null
) => {
  try {
    const fileName = generateFileName(originalName);
    const key = generateKey(folder, subfolder, fileName);

    logger.info("Starting S3 upload", {
      fileName,
      key,
      size: fileBuffer.length,
      mimeType: MimeType,
    });

    const uploadCommand = new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: MimeType,
      // Note: ACL removed - use bucket policy instead for public access
      // ACLs are disabled by default on new S3 buckets (as of April 2023)

      Metadata: {
        originalName,
        uploadedAt: new Date().toISOString(),
      },

      ServerSideEncryption: "AES256",
    });

    await s3Client.send(uploadCommand);

    const fileUrl = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;

    logger.info("S3 upload successful", {
      url: fileUrl,
      key,
      size: fileBuffer.length,
    });

    return {
      success: true,
      fileName,
      key,
      url: fileUrl,
      size: fileBuffer.length,
      mimeType: MimeType,
    };
  } catch (error) {
    logger.errorWithStack("S3 upload failed", error, {
      fileName: originalName,
      mimeType: MimeType,
      size: fileBuffer?.length,
    });

    throw createServerError(
      `Failed to upload file to S3: ${error.message}`,
      { originalName, error: error.message },
      "S3_UPLOAD_ERROR"
    );
  }
};

const deleteFile = async (key) => {
  try {
    logger.info("Deleting file from S3", { key });

    const deleteCommand = new DeleteObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    logger.info("S3 file deleted successfully", { key });

    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    logger.errorWithStack("S3 delete failed", error, { key });

    throw createServerError(
      `Failed to delete file from S3: ${error.message}`,
      { key, error: error.message },
      "S3_DELETE_ERROR"
    );
  }
};

const deleteMultipleFiles = async (keys) => {
  try {
    logger.info("Deleting multiple files from S3", { count: keys.length });

    const deletePromises = keys.map((key) => deleteFile(key));
    await Promise.all(deletePromises);

    logger.info("Multiple S3 files deleted successfully", {
      count: keys.length,
    });

    return { success: true, message: "Files deleted successfully" };
  } catch (error) {
    logger.errorWithStack("S3 bulk delete failed", error, {
      count: keys.length,
    });

    throw createServerError(
      `Failed to delete files from S3: ${error.message}`,
      { count: keys.length, error: error.message },
      "S3_BULK_DELETE_ERROR"
    );
  }
};

const getSignedUrlForFile = async (key, expiresIn = 3600) => {
  try {
    logger.info("Generating signed URL", { key, expiresIn });

    const command = new GetObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    logger.info("Signed URL generated successfully", { key });

    return signedUrl;
  } catch (error) {
    logger.errorWithStack("Failed to generate signed URL", error, { key });

    throw createServerError(
      `Failed to generate signed URL: ${error.message}`,
      { key, error: error.message },
      "S3_GET_SIGNED_URL_ERROR"
    );
  }
};

module.exports = {
  generateFileName,
  generateKey,
  uploadFile,
  deleteFile,
  deleteMultipleFiles,
  getSignedUrlForFile,
};
