/**
 * imageCrop.js - Client-side image cropping utilities
 *
 * PURPOSE: Provide actual image cropping functionality using Canvas API
 * FEATURES:
 * - Crop images based on zoom, position, and dimensions
 * - Support rectangular and circular crops
 * - Generate new File/Blob with cropped image
 * - Maintain image quality
 */

/**
 * Load image from file or URL
 * @param {File|string} source - File object or image URL
 * @returns {Promise<HTMLImageElement>}
 */
export const loadImage = (source) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Handle CORS if needed

    img.onload = () => resolve(img);
    img.onerror = (error) => reject(new Error("Failed to load image"));

    if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  });
};

/**
 * Crop image with zoom and position
 * @param {File} file - Original image file
 * @param {Object} cropData - Crop parameters
 * @param {number} cropData.x - X position offset (from drag in screen pixels)
 * @param {number} cropData.y - Y position offset (from drag in screen pixels)
 * @param {number} cropData.scale - Zoom scale (1 = fit to container)
 * @param {number} cropData.width - Output canvas width
 * @param {number} cropData.height - Output canvas height
 * @param {number} cropData.previewWidth - Preview container width (optional, for accurate scaling)
 * @param {number} cropData.previewHeight - Preview container height (optional, for accurate scaling)
 * @param {string} cropData.objectFit - CSS objectFit mode: 'contain' or 'cover' (default: 'contain')
 * @param {boolean} circular - Create circular crop (for avatars)
 * @returns {Promise<File>} - Cropped image as new File
 */
export const cropImage = async (file, cropData = {}, circular = false) => {
  const {
    x = 0,
    y = 0,
    scale = 1,
    width = 800,
    height = 600,
    previewWidth,
    previewHeight,
    objectFit = "contain", // 'contain' or 'cover'
  } = cropData;

  try {
    // Load the original image
    const img = await loadImage(file);

    // Create canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size to desired output size
    canvas.width = width;
    canvas.height = height;

    // Debug logging
    console.log("=== CROP DEBUG ===");
    console.log("Image natural size:", img.width, "x", img.height);
    console.log("Output canvas size:", width, "x", height);
    console.log("User crop data:", { x, y, scale });
    console.log("Object fit mode:", objectFit);
    console.log("Preview container size:", previewWidth, "x", previewHeight);

    // For circular crop, create clipping path BEFORE drawing
    if (circular) {
      ctx.beginPath();
      ctx.arc(
        width / 2,
        height / 2,
        Math.min(width, height) / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
    }

    /**
     * CRITICAL FIX: Account for CSS objectFit behavior
     *
     * Two modes:
     * 1. objectFit: 'contain' - Scale image to fit inside box (maintain aspect, may have gaps)
     * 2. objectFit: 'cover' - Scale image to fill box completely (maintain aspect, may crop)
     *
     * The problem:
     * - CSS preview uses objectFit which scales the image before user's zoom
     * - User's zoom (scale) is applied to the FITTED size, not original
     * - Canvas needs to replicate this by:
     *   a) Calculate what size the image would be when fitted to PREVIEW dimensions
     *   b) Apply user's scale to THAT size
     *   c) Position correctly with user's drag offsets
     *   d) Scale everything up to final output dimensions
     */

    // Step 1: Calculate how objectFit would scale the image IN THE PREVIEW CONTAINER
    // If preview dimensions not provided, fall back to output dimensions
    const previewContainerWidth = previewWidth || width;
    const previewContainerHeight = previewHeight || height;

    const imageAspect = img.width / img.height;
    const previewAspect = previewContainerWidth / previewContainerHeight;

    let containedWidth, containedHeight;

    if (objectFit === "cover") {
      // COVER: Scale to fill entire preview box (larger dimension wins)
      if (imageAspect > previewAspect) {
        // Image is wider - fit to height, crop width
        containedHeight = previewContainerHeight;
        containedWidth = previewContainerHeight * imageAspect;
      } else {
        // Image is taller - fit to width, crop height
        containedWidth = previewContainerWidth;
        containedHeight = previewContainerWidth / imageAspect;
      }
    } else {
      // CONTAIN: Scale to fit inside preview box (smaller dimension wins)
      if (imageAspect > previewAspect) {
        // Image is wider - fit to width
        containedWidth = previewContainerWidth;
        containedHeight = previewContainerWidth / imageAspect;
      } else {
        // Image is taller - fit to height
        containedHeight = previewContainerHeight;
        containedWidth = previewContainerHeight * imageAspect;
      }
    }

    console.log(
      `Contained size (before user zoom, mode: ${objectFit}):`,
      containedWidth,
      "x",
      containedHeight
    );

    // Step 2: Apply user's zoom scale to the contained size
    const scaledWidth = containedWidth * scale;
    const scaledHeight = containedHeight * scale;

    console.log(
      "Scaled size (after user zoom):",
      scaledWidth,
      "x",
      scaledHeight
    );

    // Step 3: Center the scaled image in preview space (before user's drag offset)
    const centerX = (previewContainerWidth - scaledWidth) / 2;
    const centerY = (previewContainerHeight - scaledHeight) / 2;

    console.log("Center offset (preview space):", centerX, centerY);

    // Step 4: Apply user's drag offset (in preview space)
    const finalX = centerX + x;
    const finalY = centerY + y;

    console.log("Final position (preview space):", finalX, finalY);

    // Step 5: Calculate scale factor from preview to output canvas
    const previewToOutputScale = Math.min(
      width / previewContainerWidth,
      height / previewContainerHeight
    );

    console.log("Preview to output scale:", previewToOutputScale);

    // Step 6: Scale everything to output canvas dimensions
    const outputScaledWidth = scaledWidth * previewToOutputScale;
    const outputScaledHeight = scaledHeight * previewToOutputScale;
    const outputX = finalX * previewToOutputScale;
    const outputY = finalY * previewToOutputScale;

    console.log(
      "Output dimensions:",
      outputScaledWidth,
      "x",
      outputScaledHeight
    );
    console.log("Output position:", outputX, outputY);
    console.log("==================");

    // Step 7: Draw the image on canvas at output scale
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      outputX,
      outputY,
      outputScaledWidth,
      outputScaledHeight
    );

    // Convert canvas to blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        file.type || "image/jpeg",
        0.95 // Quality
      );
    });

    // Create new File from blob
    const croppedFile = new File([blob], file.name, {
      type: file.type || "image/jpeg",
    });

    return croppedFile;
  } catch (error) {
    console.error("Image crop error:", error);
    throw new Error(`Failed to crop image: ${error.message}`);
  }
};

/**
 * Crop image to fit within dimensions (for listings)
 * @param {File} file - Original image file
 * @param {Object} cropData - Crop parameters with x, y, scale
 * @returns {Promise<File>} - Cropped image file
 */
export const cropListingImage = async (file, cropData) => {
  // For listing images, maintain aspect ratio from original
  const img = await loadImage(file);

  // Use square output to match square preview
  const maxDimension = 1200;

  return cropImage(
    file,
    {
      ...cropData,
      width: maxDimension,
      height: maxDimension,
      objectFit: "contain", // Listing images use contain to preserve aspect ratio
    },
    false
  );
};

/**
 * Crop image to circular avatar
 * @param {File} file - Original image file
 * @param {Object} cropData - Crop parameters with x, y, scale
 * @param {number} size - Avatar size (default 240x240)
 * @returns {Promise<File>} - Cropped circular avatar file
 */
export const cropAvatarImage = async (file, cropData, size = 240) => {
  return cropImage(
    file,
    {
      ...cropData,
      width: size,
      height: size,
      objectFit: "cover", // Avatar uses cover to fill the circle
    },
    true
  );
};

/**
 * Get image dimensions
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = async (file) => {
  const img = await loadImage(file);
  return {
    width: img.width,
    height: img.height,
  };
};
