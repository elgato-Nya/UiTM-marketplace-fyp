/**
 * createListing(userId, listingData)
 * updateListing(listingId, userId, updateData)
 * deleteListing(listingId, userId)
 * getListingById(listingId)
 * toggleAvailability(listingId, userId)
 * Justification: Core business logic for listing management, separate from HTTP concerns.
 */
const Listing = require("../../models/listing/listing.model");
const User = require("../../models/user/user.model");
const { sanitizeObject } = require("../../utils/sanitizer");
const { createForbiddenError } = require("../../utils/errors");
const {
  handleServiceError,
  handleNotFoundError,
  buildSort,
  generateCacheKey,
  buildSelect,
} = require("../base.service");
const logger = require("../../utils/logger");
const Fuse = require("fuse.js");

/**
 *  Create new listing
 *  @param {String} userId - ID of the user creating the listing
 *  @param {Object} listingData - Data for the new listing
 *  @returns {Promise<Listing>} - The created listing
 */
const createListing = async (userId, listingData) => {
  try {
    const sanitizedData = sanitizeObject(listingData);

    const listing = new Listing({
      ...sanitizedData,
      seller: { userId },
    });

    await listing.save();

    logger.info("Listing created successfully", {
      listingId: listing._id.toString(),
      sellerId: userId.toString(),
      type: listing.type,
      name: listing.name,
      category: listing.category,
      action: "create_listing",
    });

    return listing.toObject();
  } catch (error) {
    return handleServiceError(error, "createListing", {
      userId,
      listingName: listingData?.name,
    });
  }
};

/**
 * PURPOSE: Get listing by ID with optional seller info and field selection
 * @param {String} listingId - Valid MongoDB ObjectId of the listing
 * @param {Object} options - Query options
 * @param {Boolean} [options.includeSeller=false] - Include seller details
 * @param {String} [options.fields] - Comma-separated allowed fields only
 * @returns {Promise<Listing>|AppError} - The listing or throws error
 */
const getListingById = async (listingId, options = {}) => {
  try {
    const { includeSeller = false, fields = "" } = options;

    // 1. Build query object
    const queryObj = { _id: listingId };

    // 2. Prepare select fields
    let selectFields = "";
    if (fields) {
      selectFields = buildSelect(fields);
    }

    // 3. Prepare populate options
    let populateOptions = null;
    if (includeSeller) {
      populateOptions = {
        path: "seller.userId",
        select:
          "merchantDetails.shopName merchantDetails.shopLogo merchantDetails.shopBanner merchantDetails.shopSlug merchantDetails.shopStatus merchantDetails.verificationStatus profile.username",
      };
    }

    // 4. Build query
    let query = Listing.findOne(queryObj);
    if (selectFields) query = query.select(selectFields);
    if (populateOptions) query = query.populate(populateOptions);

    // 5. Execute query
    const listing = await query.exec();
    if (!listing) {
      return handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "getListingById",
        {
          listingId,
        }
      );
    }

    return listing.toObject();
  } catch (error) {
    return handleServiceError(error, "getListingById", { listingId });
  }
};

/**
 * PURPOSE: Get all listings for a specific seller with pagination, sorting, and filtering
 * @param {String} userId - ID of the seller
 * @param {Object} options - Query options
 * @param {Number} [options.page=1] - Page number for pagination
 * @param {Number} [options.limit=20] - Number of listings per page (max 100)
 * @param {String} [options.sort] - Comma-separated sort fields (e.g., 'price,-createdAt')
 * @param {Boolean} [options.includeUnavailable=false] - Include unavailable listings
 * @param {String} [options.type] - Filter by listing type
 * @param {String} [options.category] - Filter by category
 * @param {String} [options.fields] - Comma-separated allowed fields only
 * @returns {Promise<Object>|AppError} - The seller's listings, paginated, and total or an error
 */
const getSellerListings = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = Math.min(options.limit || 24, 100), // Cap at 100, default 24
      sort: sortQuery,
      includeUnavailable = false,
      type,
      category,
      fields,
      search,
    } = options;

    const query = { "seller.userId": userId };

    if (!includeUnavailable) {
      query.isAvailable = true;
    }
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }

    // Build sort with proper error handling
    const sort = buildSort(sortQuery ? { sort: sortQuery } : {}, [
      "createdAt",
      "name",
      "price",
      "updatedAt",
    ]);

    let selectFields = "";
    if (fields) {
      selectFields = buildSelect(fields);
    }

    // If search exists, use Fuse.js for fuzzy search (typo-tolerant)
    if (search && search.trim()) {
      // First, get all matching listings without search filter
      const allListings = await Listing.find(query)
        .select(selectFields)
        .sort(sort)
        .exec();

      // Configure Fuse.js for fuzzy search
      const fuseOptions = {
        keys: ["name"], // Search in name field
        threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
        distance: 100, // Max distance between characters
        ignoreLocation: true, // Don't care where in string match occurs
        includeScore: true,
        minMatchCharLength: 2,
      };

      const fuse = new Fuse(allListings, fuseOptions);
      const searchResults = fuse.search(search.trim());

      // Extract actual listings from Fuse results
      const searchedListings = searchResults.map((result) => result.item);

      // Apply pagination to search results
      const total = searchedListings.length;
      const startIndex = (page - 1) * limit;
      const paginatedListings = searchedListings.slice(
        startIndex,
        startIndex + limit
      );

      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalListings: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        limit,
      };

      return {
        listings: paginatedListings,
        pagination,
        total,
      };
    }

    // No search: standard MongoDB query with pagination
    const [listings, total] = await Promise.all([
      Listing.find(query)
        .select(selectFields)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(),
      Listing.countDocuments(query),
    ]);

    // Build pagination response object
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalListings: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      limit,
    };

    return {
      listings,
      pagination,
      total,
    };
  } catch (error) {
    return handleServiceError(error, "getSellerListings", { userId });
  }
};

/**
 * Get all public listings with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Listings with pagination metadata
 * @note Public endpoint - only returns available listings
 */
const getAllListings = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = Math.min(options.limit || 24, 100), // Cap at 100, default 24
      sort: sortQuery,
      includeUnavailable = false,
      type,
      category,
      fields,
      search,
    } = options;

    // Base query - only available listings for public access
    const query = {};

    if (!includeUnavailable) {
      query.isAvailable = true;
    }
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }

    // Build sort with proper error handling
    const sort = buildSort(sortQuery ? { sort: sortQuery } : {}, [
      "createdAt",
      "name",
      "price",
      "updatedAt",
    ]);

    let selectFields = "";
    if (fields) {
      selectFields = buildSelect(fields);
    }

    // If search exists, use aggregation with lookup to filter suspended merchants
    if (search && search.trim()) {
      // Use MongoDB aggregation to join with User collection and filter at query level
      const aggregationPipeline = [
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "seller.userId",
            foreignField: "_id",
            as: "sellerUser",
          },
        },
        { $unwind: "$sellerUser" },
        {
          $match: {
            "sellerUser.isSuspended": { $ne: true },
          },
        },
        { $sort: sort },
      ];

      // Add field selection if specified
      if (selectFields) {
        const projection = {};
        selectFields.split(" ").forEach((field) => {
          projection[field] = 1;
        });
        aggregationPipeline.push({ $project: projection });
      }

      const allListings = await Listing.aggregate(aggregationPipeline);

      // Populate seller info manually for aggregated results
      await Listing.populate(allListings, {
        path: "seller.userId",
        select: "name email",
      });

      // Configure Fuse.js for fuzzy search
      const fuseOptions = {
        keys: ["name"],
        threshold: 0.4,
        distance: 100,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2,
      };

      const fuse = new Fuse(allListings, fuseOptions);
      const searchResults = fuse.search(search.trim());

      // Extract actual listings from Fuse results
      const searchedListings = searchResults.map((result) => result.item);

      // Apply pagination to search results
      const total = searchedListings.length;
      const startIndex = (page - 1) * limit;
      const paginatedListings = searchedListings.slice(
        startIndex,
        startIndex + limit
      );

      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalListings: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        limit,
      };

      logger.info("All listings fetched successfully with fuzzy search", {
        total,
        page,
        limit,
        type,
        category,
        search,
        action: "get_all_listings",
      });

      return {
        listings: paginatedListings,
        pagination,
        total,
      };
    }

    // No search: Use aggregation to filter at query level
    const aggregationPipeline = [
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "seller.userId",
          foreignField: "_id",
          as: "sellerUser",
        },
      },
      { $unwind: "$sellerUser" },
      {
        $match: {
          "sellerUser.isSuspended": { $ne: true },
        },
      },
    ];

    // Get total count before pagination
    const countPipeline = [...aggregationPipeline, { $count: "total" }];
    const countResult = await Listing.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add sorting, pagination, and field selection
    aggregationPipeline.push({ $sort: sort });
    aggregationPipeline.push({ $skip: (page - 1) * limit });
    aggregationPipeline.push({ $limit: limit });

    if (selectFields) {
      const projection = {};
      selectFields.split(" ").forEach((field) => {
        projection[field] = 1;
      });
      aggregationPipeline.push({ $project: projection });
    }

    const listings = await Listing.aggregate(aggregationPipeline);

    // Populate seller info for aggregated results
    await Listing.populate(listings, {
      path: "seller.userId",
      select: "name email",
    });

    // Build pagination response object
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalListings: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      limit,
    };

    logger.info("All listings fetched successfully", {
      total,
      page,
      limit,
      type,
      category,
      action: "get_all_listings",
    });

    return {
      listings,
      pagination,
      total,
    };
  } catch (error) {
    return handleServiceError(error, "getAllListings", { options });
  }
};

/**
 * Update an existing listing
 * @param {String} listingId - ID of the listing to update
 * @param {String} userId - ID of the user making the request
 * @param {Object} updateData - Data to update the listing with
 * @returns {Promise<Listing>}
 * NOTE: Authorization handled by isListingOwner middleware
 */
const updateListing = async (listingId, userId, updateData) => {
  try {
    // Authorization handled by middleware - no need for ownership checks
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "updateListing",
        { listingId, userId }
      );
    }

    const sanitizedData = sanitizeObject(updateData);

    // Prevent updating protected fields (following your security pattern)
    delete sanitizedData.seller;
    delete sanitizedData._id;
    delete sanitizedData.createdAt;
    delete sanitizedData.updatedAt;

    Object.assign(listing, sanitizedData);
    await listing.save();

    logger.info("Listing updated successfully", {
      listingId: listingId.toString(),
      userId: userId.toString(),
      updatedFields: Object.keys(sanitizedData),
      action: "update_listing",
    });

    return listing.toObject();
  } catch (error) {
    return handleServiceError(error, "updateListing", {
      listingId: listingId.toString(),
      userId: userId.toString(),
    });
  }
};

/**
 * Delete a listing (soft or permanent)
 * @param {String} listingId - ID of the listing to delete
 * @param {String} userId - ID of the user making the request
 * @param {Boolean} isPermanent - If true, permanently delete; if false, soft delete
 * @returns {Promise<Boolean|Listing>}
 * NOTE: Authorization handled by isListingOwner middleware
 */
const deleteListing = async (listingId, userId, isPermanent = false) => {
  try {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "deleteListing",
        { listingId, userId }
      );
    }

    if (isPermanent) {
      // Permanent delete - remove from database
      await Listing.findByIdAndDelete(listingId);

      logger.info("Listing permanently deleted", {
        listingId,
        userId,
        action: "permanent_delete_listing",
      });

      return { deleted: true };
    } else {
      // Soft delete by marking as unavailable
      listing.isAvailable = false;
      await listing.save();

      logger.info("Listing soft deleted (marked unavailable)", {
        listingId: listingId.toString(),
        userId: userId.toString(),
        action: "soft_delete_listing",
      });

      return listing;
    }
  } catch (error) {
    return handleServiceError(error, "deleteListing", {
      listingId,
      userId,
      isPermanent,
    });
  }
};

/**
 * Toggle listing availability (active/inactive)
 * @param {String} listingId - ID of the listing to update
 * @param {String} userId - ID of the user making the request
 * @returns {Promise<Listing>}
 * NOTE: Authorization handled by isListingOwner middleware
 */
const toggleAvailability = async (listingId, userId) => {
  try {
    // Authorization handled by middleware - no need for ownership checks
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "toggleAvailability",
        { listingId, userId }
      );
    }

    listing.isAvailable = !listing.isAvailable;
    await listing.save();

    logger.info("Listing availability toggled successfully", {
      listingId: listing._id.toString(),
      userId: userId.toString(),
      newAvailability: listing.isAvailable,
      action: "toggle_listing_availability",
    });

    return listing;
  } catch (error) {
    return handleServiceError(error, "toggleAvailability", {
      listingId: listingId.toString(),
      userId: userId.toString(),
    });
  }
};

// ======================   VARIANT SERVICE METHODS   ========================

/**
 * Add a variant to an existing listing
 * @param {String} listingId - ID of the listing
 * @param {String} userId - ID of the user (for authorization)
 * @param {Object} variantData - Variant data to add
 * @returns {Promise<Object>} - The added variant
 * NOTE: Authorization handled by isListingOwner middleware
 */
const addVariant = async (listingId, userId, variantData) => {
  try {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return handleNotFoundError("Listing", "LISTING_NOT_FOUND", "addVariant", {
        listingId,
        userId,
      });
    }

    // Initialize variants array if it doesn't exist
    if (!listing.variants) {
      listing.variants = [];
    }

    // Check variant limit
    const { VariantLimits } = require("../../utils/enums/listing.enum");
    if (listing.variants.length >= VariantLimits.MAX_VARIANTS_PER_LISTING) {
      const { createBadRequestError } = require("../../utils/errors");
      throw createBadRequestError(
        `Maximum ${VariantLimits.MAX_VARIANTS_PER_LISTING} variants allowed per listing`,
        "VARIANT_LIMIT_REACHED"
      );
    }

    // Validate stock is provided for products
    if (
      listing.type === "product" &&
      (variantData.stock === undefined || variantData.stock === null)
    ) {
      const { createValidationError } = require("../../utils/errors");
      throw createValidationError(
        "Stock is required for product variants",
        [],
        "VARIANT_STOCK_REQUIRED"
      );
    }

    // Add the variant
    listing.variants.push(sanitizeObject(variantData));
    await listing.save();

    const addedVariant = listing.variants[listing.variants.length - 1];

    logger.info("Variant added successfully", {
      listingId: listingId.toString(),
      variantId: addedVariant._id.toString(),
      variantName: addedVariant.name,
      userId: userId.toString(),
      action: "add_variant",
    });

    return addedVariant.toObject();
  } catch (error) {
    return handleServiceError(error, "addVariant", {
      listingId,
      userId,
      variantName: variantData?.name,
    });
  }
};

/**
 * Update an existing variant
 * @param {String} listingId - ID of the listing
 * @param {String} variantId - ID of the variant to update
 * @param {String} userId - ID of the user (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - The updated variant
 */
const updateVariant = async (listingId, variantId, userId, updateData) => {
  try {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "updateVariant",
        { listingId, userId }
      );
    }

    const variant = listing.getVariant(variantId);
    if (!variant) {
      return handleNotFoundError(
        "Variant",
        "VARIANT_NOT_FOUND",
        "updateVariant",
        { listingId, variantId, userId }
      );
    }

    // Sanitize and apply updates
    const sanitizedData = sanitizeObject(updateData);

    // Prevent updating protected fields
    delete sanitizedData._id;
    delete sanitizedData.createdAt;

    Object.assign(variant, sanitizedData);
    await listing.save();

    logger.info("Variant updated successfully", {
      listingId: listingId.toString(),
      variantId: variantId.toString(),
      updatedFields: Object.keys(sanitizedData),
      userId: userId.toString(),
      action: "update_variant",
    });

    return variant.toObject();
  } catch (error) {
    return handleServiceError(error, "updateVariant", {
      listingId,
      variantId,
      userId,
    });
  }
};

/**
 * Delete a variant (soft delete by marking unavailable)
 * @param {String} listingId - ID of the listing
 * @param {String} variantId - ID of the variant to delete
 * @param {String} userId - ID of the user (for authorization)
 * @param {Boolean} permanent - If true, permanently remove; if false, soft delete
 * @returns {Promise<Object>} - Result of deletion
 */
const deleteVariant = async (
  listingId,
  variantId,
  userId,
  permanent = false
) => {
  try {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "deleteVariant",
        { listingId, userId }
      );
    }

    const variant = listing.getVariant(variantId);
    if (!variant) {
      return handleNotFoundError(
        "Variant",
        "VARIANT_NOT_FOUND",
        "deleteVariant",
        { listingId, variantId, userId }
      );
    }

    if (permanent) {
      // Permanently remove the variant
      listing.variants.pull(variantId);
      await listing.save();

      logger.info("Variant permanently deleted", {
        listingId: listingId.toString(),
        variantId: variantId.toString(),
        userId: userId.toString(),
        action: "permanent_delete_variant",
      });

      return { deleted: true, permanent: true };
    } else {
      // Soft delete - mark as unavailable
      variant.isAvailable = false;
      await listing.save();

      logger.info("Variant soft deleted (marked unavailable)", {
        listingId: listingId.toString(),
        variantId: variantId.toString(),
        userId: userId.toString(),
        action: "soft_delete_variant",
      });

      return { deleted: true, permanent: false, variant: variant.toObject() };
    }
  } catch (error) {
    return handleServiceError(error, "deleteVariant", {
      listingId,
      variantId,
      userId,
      permanent,
    });
  }
};

/**
 * Get a specific variant by ID
 * @param {String} listingId - ID of the listing
 * @param {String} variantId - ID of the variant
 * @returns {Promise<Object>} - The variant
 */
const getVariant = async (listingId, variantId) => {
  try {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return handleNotFoundError("Listing", "LISTING_NOT_FOUND", "getVariant", {
        listingId,
      });
    }

    const variant = listing.getVariant(variantId);
    if (!variant) {
      return handleNotFoundError("Variant", "VARIANT_NOT_FOUND", "getVariant", {
        listingId,
        variantId,
      });
    }

    return variant.toObject();
  } catch (error) {
    return handleServiceError(error, "getVariant", { listingId, variantId });
  }
};

/**
 * Get all variants for a listing
 * @param {String} listingId - ID of the listing
 * @param {Object} options - Query options
 * @param {Boolean} options.includeUnavailable - Include unavailable variants
 * @returns {Promise<Array>} - Array of variants
 */
const getListingVariants = async (listingId, options = {}) => {
  try {
    const { includeUnavailable = false } = options;

    const listing = await Listing.findById(listingId).select("variants type");

    if (!listing) {
      return handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "getListingVariants",
        { listingId }
      );
    }

    if (!listing.variants || listing.variants.length === 0) {
      return [];
    }

    let variants = listing.variants.map((v) => v.toObject());

    if (!includeUnavailable) {
      variants = variants.filter((v) => v.isAvailable);
    }

    return variants;
  } catch (error) {
    return handleServiceError(error, "getListingVariants", { listingId });
  }
};

/**
 * Deduct stock from a specific variant
 * @param {String} listingId - ID of the listing
 * @param {String} variantId - ID of the variant
 * @param {Number} quantity - Quantity to deduct
 * @returns {Promise<Object>} - Updated variant
 */
const deductVariantStock = async (listingId, variantId, quantity) => {
  try {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "deductVariantStock",
        { listingId }
      );
    }

    const variant = listing.getVariant(variantId);
    if (!variant) {
      return handleNotFoundError(
        "Variant",
        "VARIANT_NOT_FOUND",
        "deductVariantStock",
        { listingId, variantId }
      );
    }

    // Check if this is a service (no stock management needed)
    if (listing.type === "service") {
      return variant.toObject();
    }

    // Check stock availability
    if (variant.stock < quantity) {
      const { createBadRequestError } = require("../../utils/errors");
      createBadRequestError(
        `Insufficient stock. Available: ${variant.stock}, Requested: ${quantity}`,
        "INSUFFICIENT_VARIANT_STOCK"
      );
    }

    variant.stock -= quantity;
    await listing.save();

    logger.info("Variant stock deducted", {
      listingId: listingId.toString(),
      variantId: variantId.toString(),
      quantity,
      newStock: variant.stock,
      action: "deduct_variant_stock",
    });

    return variant.toObject();
  } catch (error) {
    return handleServiceError(error, "deductVariantStock", {
      listingId,
      variantId,
      quantity,
    });
  }
};

/**
 * Restore stock to a specific variant (for order cancellation)
 * @param {String} listingId - ID of the listing
 * @param {String} variantId - ID of the variant
 * @param {Number} quantity - Quantity to restore
 * @returns {Promise<Object>} - Updated variant
 */
const restoreVariantStock = async (listingId, variantId, quantity) => {
  try {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return handleNotFoundError(
        "Listing",
        "LISTING_NOT_FOUND",
        "restoreVariantStock",
        { listingId }
      );
    }

    const variant = listing.getVariant(variantId);
    if (!variant) {
      return handleNotFoundError(
        "Variant",
        "VARIANT_NOT_FOUND",
        "restoreVariantStock",
        { listingId, variantId }
      );
    }

    // Skip for services
    if (listing.type === "service") {
      return variant.toObject();
    }

    variant.stock += quantity;
    await listing.save();

    logger.info("Variant stock restored", {
      listingId: listingId.toString(),
      variantId: variantId.toString(),
      quantity,
      newStock: variant.stock,
      action: "restore_variant_stock",
    });

    return variant.toObject();
  } catch (error) {
    return handleServiceError(error, "restoreVariantStock", {
      listingId,
      variantId,
      quantity,
    });
  }
};

module.exports = {
  createListing,
  getListingById,
  getAllListings,
  getSellerListings,
  updateListing,
  deleteListing,
  toggleAvailability,
  // Variant methods
  addVariant,
  updateVariant,
  deleteVariant,
  getVariant,
  getListingVariants,
  deductVariantStock,
  restoreVariantStock,
};
