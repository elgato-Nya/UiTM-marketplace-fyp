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
        // ? idk man, i just instinctively select these fields for now
        select:
          "merchantDetails.description merchantDetails.shopLogo merchantDetails.shopBanner merchantDetails.shopStatus profile.username",
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

module.exports = {
  createListing,
  getListingById,
  getAllListings,
  getSellerListings,
  updateListing,
  deleteListing,
  toggleAvailability,
};

// TODO: Really think about what is really necessary in this file and remove anything that is not
// server/services/listing/listing-search.service.js
/**
 * searchListings(filters, pagination)
 * getListingsByCategory(category, options)
 * getListingsByPriceRange(min, max, options)
 * getFeaturedListings(options)
 * getRecentListings(options)
 * Justification: Search is complex enough to warrant separate service, enables caching and optimization.
 */
