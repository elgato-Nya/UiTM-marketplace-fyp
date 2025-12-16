const sharp = require("sharp");
const { s3Config } = require("../../config/s3.config");
const {
  createValidationError,
  createServerError,
} = require("../../utils/errors");
const logger = require("../../utils/logger");

const optimizeImage = async (buffer, options = {}) => {
  try {
    const {
      maxWidth = s3Config.maxWidth,
      maxHeight = s3Config.maxHeight,
      quality = s3Config.imageQuality,
      format = "jpeg",
    } = options;

    const metadata = await sharp(buffer).metadata();

    logger.info("Processing image optimization", {
      originalSize: `${metadata.width}x${metadata.height}`,
      format: metadata.format,
      targetFormat: format,
    });

    // Start the pipeline process - DO NOT auto-rotate to prevent unwanted rotation
    let pipeline = sharp(buffer);

    // Only resize if image exceeds maximum dimensions
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: "inside", // Maintain aspect ratio without cropping
        withoutEnlargement: true, // Do not enlarge smaller images
      });

      logger.info("Resizing image to fit within limits", {
        from: `${metadata.width}x${metadata.height}`,
        maxDimensions: `${maxWidth}x${maxHeight}`,
      });
    }

    switch (format) {
      case "jpeg":
      case "jpg":
        pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
        break;
      case "png":
        pipeline = pipeline.png({ compressionLevel: 9, progressive: true });
        break;
      case "webp":
        pipeline = pipeline.webp({ quality, lossless: false });
        break;
    }

    // Strip metadata to reduce file size and protect privacy
    // Remove EXIF data including orientation to prevent rotation
    pipeline = pipeline.withMetadata({
      orientation: undefined, // Remove orientation data
    });

    // Execute the pipeline and get the optimized buffer
    const processedBuffer = await pipeline.toBuffer();

    const originalSize = buffer.length;
    const optimizedSize = processedBuffer.length;
    const reductionPercent = (
      ((originalSize - optimizedSize) / originalSize) *
      100
    ).toFixed(2);

    logger.info("Image optimization complete", {
      originalSize,
      optimizedSize,
      reduction: `${reductionPercent}%`,
    });

    return {
      buffer: processedBuffer,
      metadata: {
        originalSize,
        optimizedSize,
        reductionPercent: `${reductionPercent}%`,
        format,
      },
    };
  } catch (error) {
    logger.errorWithStack("Image optimization failed", error, {
      bufferSize: buffer?.length,
    });

    throw createServerError(
      `Image optimization failed: ${error.message}`,
      { error: error.message },
      "IMAGE_OPTIMIZATION_ERROR"
    );
  }
};

const createThumbnail = async (buffer, options = {}) => {
  try {
    const {
      width = s3Config.thumbnailWidth,
      height = s3Config.thumbnailHeight,
      quality = 80,
    } = options;

    logger.info("Creating thumbnail", { width, height, quality });

    const thumbnailBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality })
      .toBuffer();

    logger.info("Thumbnail created successfully", {
      size: `${width}x${height}`,
      bytes: thumbnailBuffer.length,
    });

    return thumbnailBuffer;
  } catch (error) {
    logger.errorWithStack("Thumbnail creation failed", error);

    throw createServerError(
      `Thumbnail creation failed: ${error.message}`,
      { error: error.message },
      "THUMBNAIL_CREATION_ERROR"
    );
  }
};

const validateImage = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();

    const allowedFormats = s3Config.allowedImageTypes.map((type) => {
      return type.split("/")[1];
    });

    if (!allowedFormats.includes(metadata.format)) {
      throw createValidationError(
        `Invalid image format. Allowed formats: ${allowedFormats.join(", ")}`,
        { format: metadata.format, allowedFormats },
        "INVALID_IMAGE_FORMAT"
      );
    }

    // check resolution
    const MAX_DIMENSION = 8000; // 8000px
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      throw createValidationError(
        `Image dimensions exceed the maximum allowed size of ${MAX_DIMENSION}px.`,
        {
          width: metadata.width,
          height: metadata.height,
          maxDimension: MAX_DIMENSION,
        },
        "IMAGE_DIMENSION_EXCEEDED"
      );
    }

    logger.info("Image validation successful", {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    });

    return {
      valid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      },
    };
  } catch (error) {
    logger.warn("Image validation failed", {
      error: error.message,
      isValidationError: error.isOperational,
    });

    if (error.isOperational) {
      // It's already our custom validation error
      return {
        valid: false,
        error,
      };
    }

    // Wrap Sharp/other errors
    return {
      valid: false,
      error: createServerError(
        `Image validation failed: ${error.message}`,
        { error: error.message },
        "IMAGE_VALIDATION_ERROR"
      ),
    };
  }
};

const processListingImage = async (buffer) => {
  // Validate
  const validation = await validateImage(buffer);
  if (!validation.valid) {
    throw validation.error;
  }

  // Optimize
  const optimized = await optimizeImage(buffer, {
    format: "jpeg",
    quality: s3Config.imageQuality,
  });

  // Create Thumbnail
  const thumbnail = await createThumbnail(buffer, {
    width: s3Config.thumbnailWidth,
    height: s3Config.thumbnailHeight,
    quality: s3Config.imageQuality - 5,
  });

  return {
    main: optimized.buffer,
    thumbnail: thumbnail,
    metadata: optimized.metadata,
  };
};

module.exports = {
  optimizeImage,
  createThumbnail,
  validateImage,
  processListingImage,
};
