const { User, Listing, Order } = require("../../models");
const { OrderValidator } = require("../../validators");
const {
  createForbiddenError,
  createValidationError,
} = require("../../utils/errors");
const {
  handleServiceError,
  handleNotFoundError,
  buildSort,
  buildSelect,
  convertAddressEnumsToValues,
} = require("../base.service");
const {
  calcDeliveryFee,
  calcEstimatedDelivery,
  validateCampusDelivery,
  handleStatusSideEffects,
} = require("./order.helpers");
const logger = require("../../utils/logger");

const createOrder = async (userId, orderData) => {
  try {
    const { items, deliveryAddress, deliveryMethod, paymentMethod } = orderData;

    const buyer = await User.findById(userId).select("+email profile roles");
    if (!buyer) {
      // TODO : Standardize handleNotFoundError accross services
      return handleNotFoundError("User", "USER_NOT_FOUND", "create_order", {
        userId,
      });
    }

    // Validate buyer has required profile data
    if (!buyer.profile?.phoneNumber) {
      return createValidationError(
        "Buyer phone number is required. Please update your profile.",
        { userId },
        "BUYER_PHONE_REQUIRED"
      );
    }

    if (!buyer.profile?.username) {
      return createValidationError(
        "Buyer username is required. Please update your profile.",
        { userId },
        "BUYER_USERNAME_REQUIRED"
      );
    }

    // Check if all listings are valid and available
    const listingIds = items.map((item) => item.listingId);
    const listings = await Listing.find({
      _id: { $in: listingIds },
      isAvailable: true,
    }).populate("seller.userId", "email profile roles merchantDetails");

    if (listings.length !== listingIds.length) {
      logger.warn(
        `Order creation failed: ${
          listingIds.length - listings.length
        } listing(s) are invalid or unavailable.`,
        {
          userId,
          attemptedListingIds: listingIds,
          foundListingIds: listings.map((l) => l._id),
        }
      );
      return createValidationError(
        "One or more listings are invalid or unavailable",
        { userId, listingIds },
        "INVALID_LISTINGS"
      );
    }

    const listingMap = new Map();
    const sellerIds = new Set();
    listings.forEach((listing) => {
      listingMap.set(listing._id.toString(), listing);
      sellerIds.add(listing.seller.userId._id.toString());
    });
    if (sellerIds.size > 1) {
      logger.warn(`Order creation failed: Items belong to multiple sellers.`, {
        userId,
        sellerIds: Array.from(sellerIds),
      });
      return createValidationError(
        "All items must belong to the same seller",
        { userId, sellerIds: Array.from(sellerIds) },
        "INVALID_LISTINGS"
      );
    }

    const processedItems = [];
    let subtotal = 0;
    const sellerId = Array.from(sellerIds)[0];

    for (const item of items) {
      const listing = listingMap.get(item.listingId.toString());

      if (!listing) {
        logger.error("Listing not found in map during order creation", {
          listingId: item.listingId,
          availableListings: Array.from(listingMap.keys()),
        });
        return createValidationError(
          `Listing ${item.listingId} not found`,
          { userId, listingId: item.listingId },
          "LISTING_NOT_FOUND"
        );
      }

      // Only check stock for products, not services
      if (listing.type === "product") {
        // Determine available stock based on variant or listing
        let availableStock;
        let variant = null;

        if (item.variantId) {
          variant = listing.variants?.id(item.variantId);
          if (!variant) {
            logger.warn(
              `Order creation failed: Variant ${item.variantId} not found for listing ${item.listingId}`,
              { userId, listingId: item.listingId, variantId: item.variantId }
            );
            return createValidationError(
              `Variant ${item.variantId} not found for listing ${item.listingId}`,
              { userId, listingId: item.listingId, variantId: item.variantId },
              "VARIANT_NOT_FOUND"
            );
          }
          if (!variant.isAvailable) {
            logger.warn(
              `Order creation failed: Variant ${item.variantId} is unavailable`,
              { userId, listingId: item.listingId, variantId: item.variantId }
            );
            return createValidationError(
              `Variant is unavailable for listing ${item.listingId}`,
              { userId, listingId: item.listingId, variantId: item.variantId },
              "VARIANT_UNAVAILABLE"
            );
          }
          availableStock = variant.stock;
        } else {
          availableStock = listing.stock;
        }

        if (item.quantity > availableStock) {
          logger.warn(
            `Order creation failed: Insufficient stock for listing ${item.listingId}. Requested: ${item.quantity}, Available: ${availableStock}`,
            {
              userId,
              listingId: item.listingId,
              variantId: item.variantId || null,
              requested: item.quantity,
            }
          );
          return createValidationError(
            `Insufficient stock for listing ${item.listingId}, only ${availableStock} left.`,
            {
              userId,
              listingId: item.listingId,
              variantId: item.variantId || null,
              requested: item.quantity,
            },
            "INSUFFICIENT_STOCK"
          );
        }
      }

      // Determine price based on variant or listing
      let itemPrice = listing.price;
      let variantSnapshot = null;

      if (item.variantId && listing.variants) {
        const variant = listing.variants.id(item.variantId);
        if (variant) {
          itemPrice = variant.price;
          variantSnapshot = {
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            attributes: variant.attributes,
          };
        }
      }

      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      const processedItem = {
        listingId: listing._id,
        name: listing.name,
        description: listing.description || "",
        price: itemPrice,
        quantity: item.quantity,
        images: listing.images || [],
        discount: 0,
        type: listing.type, // Store type to check later for stock updates
      };

      // Add variant data if present
      if (item.variantId) {
        processedItem.variantId = item.variantId;
      }
      if (variantSnapshot) {
        processedItem.variantSnapshot = variantSnapshot;
      }

      processedItems.push(processedItem);
    }

    const seller = await User.findById(sellerId).select(
      "+email profile roles merchantDetails"
    );

    if (!seller) {
      return handleNotFoundError("Seller", "SELLER_NOT_FOUND", "create_order", {
        sellerId,
      });
    }

    // Get seller display name
    const sellerDisplayName = seller.roles.includes("merchant")
      ? seller.merchantDetails?.shopName || seller.profile.username
      : seller.profile.username;

    // Validate seller has required data
    if (!seller.profile?.phoneNumber) {
      logger.warn("Seller phone number missing, using default", {
        sellerId,
        sellerName: sellerDisplayName,
      });
    }

    // Validate campus delivery if applicable
    const isCampusDelivery = ["campus_delivery", "room_delivery"].includes(
      deliveryMethod
    );
    if (isCampusDelivery && deliveryAddress?.type === "campus") {
      const campusKey = deliveryAddress.campusAddress?.campus;
      const campusValidation = await validateCampusDelivery(
        sellerId,
        campusKey
      );

      if (!campusValidation.valid) {
        logger.warn("Campus delivery validation failed", {
          userId,
          sellerId,
          sellerName: sellerDisplayName,
          campus: campusKey,
          reason: campusValidation.reason,
        });
        return createValidationError(
          campusValidation.reason ||
            "This merchant does not deliver to the selected campus",
          {
            userId,
            sellerId,
            campus: campusKey,
            deliveryMethod,
          },
          "CAMPUS_NOT_DELIVERABLE"
        );
      }
    }

    const shippingFee = await calcDeliveryFee(
      deliveryMethod,
      sellerId,
      subtotal
    );
    const totalAmount = subtotal + shippingFee;

    const orderObject = {
      buyer: {
        userId: buyer._id,
        username: buyer.profile.username,
        email: buyer.email,
        phone: buyer.profile.phoneNumber,
      },
      seller: {
        userId: seller._id,
        name: sellerDisplayName,
        email: seller.email,
        phone: seller.profile.phoneNumber || "0123456789", // Fallback for missing phone
      },
      items: processedItems,
      itemsTotal: subtotal,
      shippingFee: shippingFee,
      totalDiscount: 0,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      paymentStatus: "pending",
      paymentDetails: {
        paidAt: null,
        transactionId: null,
      },
      deliveryMethod: deliveryMethod,
      deliveryAddress: deliveryAddress,
      status: "pending",
    };

    const order = new Order(orderObject);
    await order.save();

    // Only update stock for products, not services
    const stockUpdates = processedItems
      .filter((item) => item.type === "product")
      .map((item) => {
        if (item.variantId) {
          // Update variant stock using the model method
          return Listing.findById(item.listingId).then((listing) => {
            if (listing) {
              return listing.deductVariantStock(item.variantId, item.quantity);
            }
          });
        } else {
          // Update listing stock directly
          return Listing.findByIdAndUpdate(
            item.listingId,
            { $inc: { stock: -item.quantity } },
            { new: true }
          );
        }
      });

    if (stockUpdates.length > 0) {
      await Promise.all(stockUpdates);
    }

    // Convert address enum keys to values for client response
    const orderObj = order.toObject();
    if (orderObj.deliveryAddress) {
      orderObj.deliveryAddress = convertAddressEnumsToValues(
        orderObj.deliveryAddress
      );
    }

    return orderObj;
  } catch (error) {
    return handleServiceError(error, "createOrder", {
      userId,
      itemCount: orderData?.items?.length,
      paymentMethod: orderData?.paymentMethod,
    });
  }
};

/**
 * PURPOSE: Retrieve an order by its ID with optional field selection and access control.
 * @param {ObjectId} orderId - ID of the order to retrieve
 * @param {Object} options - contains userId, userRoles, fields to select, and includeHistory flag
 * @param {ObjectId} [options.userId] - ID of the requesting user
 * @param {Array<string>} [options.userRoles] - Roles of the requesting user (if includes admin)
 * @param {string} [options.fields] - Comma-separated fields to include in the response
 * @param {boolean} [options.includeHistory=false] - Whether to include status history
 * @returns {Promise<Order>} - The retrieved order
 */
const getOrderById = async (orderId, options = {}) => {
  try {
    const { userId, userRoles, fields = "", includeHistory = false } = options;

    let selectFields = "";
    if (fields) {
      selectFields = buildSelect(fields);
    }

    if (!includeHistory) {
      selectFields += " -statusHistory";
    }

    let query = Order.findById(orderId);
    if (selectFields) query = query.select(selectFields);

    const order = await query.exec();
    if (!order) {
      return handleNotFoundError(
        "Order",
        "ORDER_NOT_FOUND",
        "get_order_by_id",
        {
          orderId,
        }
      );
    }

    if (userId && userRoles) {
      if (!order.canUserView(userId, userRoles)) {
        return createForbiddenError(
          "You do not have permission to view this order",
          "FORBIDDEN",
          "get_order_by_id",
          { userId, userRoles, orderId }
        );
      }
    }

    // Convert address enum keys to values for client response
    const orderObj = order.toObject();
    if (orderObj.deliveryAddress) {
      orderObj.deliveryAddress = convertAddressEnumsToValues(
        orderObj.deliveryAddress
      );
    }

    return orderObj;
  } catch (error) {
    return handleServiceError(error, "getOrderById", {
      orderId,
      userId: userId ? userId : null,
      userRoles,
    });
  }
};

/**
 * Retrieves orders for a specific user based on their role and various filtering options.
 * @param {ObjectId} userId - The ID of the user whose orders are to be retrieved.
 * @param {string} role - The role of the user (e.g., buyer, seller, admin).
 * @param {Object} options - Additional options for filtering and pagination, including status, paymentStatus, deliveryStatus, startDate, endDate, fields
 * @returns {Promise<Array>} - A promise that resolves to an array of orders.
 */
const getUserOrders = async (userId, role, options = {}) => {
  try {
    const {
      page = 1,
      limit = Math.min(options.limit || 20, 100),
      sort: sortQuery,
      status,
      paymentStatus,
      deliveryStatus,
      startDate,
      endDate,
      fields,
    } = options;

    const query = {};

    if (role === "buyer") {
      query["buyer.userId"] = userId;
    } else if (role === "seller") {
      query["seller.userId"] = userId;
    } else if (role === "admin") {
      // ! Leave the condition here, admin can view all orders
    } else {
      logger.warn("Invalid role specified for getUserOrders", {
        userId,
        role,
      });
      throw createValidationError(
        "Invalid role specified",
        { userId, role },
        "INVALID_ORDER_ROLE"
      );
    }

    if (status) query.status = status;
    if (paymentStatus) query["payment.status"] = paymentStatus;
    if (deliveryStatus) query["delivery.status"] = deliveryStatus;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sort = buildSort({ sort: sortQuery }, [
      "createdAt",
      "totalAmount",
      "status",
      "updatedAt",
    ]);

    let selectFields = "";
    if (fields) {
      selectFields = buildSelect(fields);
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .select(selectFields)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(),
      Order.countDocuments(query),
    ]);

    // Convert address enum keys to values for client response
    const convertedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      if (orderObj.deliveryAddress) {
        orderObj.deliveryAddress = convertAddressEnumsToValues(
          orderObj.deliveryAddress
        );
      }
      return orderObj;
    });

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      limit,
    };

    return {
      orders: convertedOrders,
      total,
      pagination,
    };
  } catch (error) {
    handleServiceError(error, "getUserOrders", { userId, role });
  }
};

/**
 * PURPOSE: Update the status of an order with proper validation and side effects.
 * @param {ObjectId} orderId - The ID of the order to update
 * @param {ObjectId} userId - The ID of the user performing the action
 * @param {string} newStatus - The new status to set
 * @param {Array<string>} userRoles - To check admin privileges
 * @param {string} note - Optional note for status change
 * @returns {Promise<Order>}
 */
const updateOrderStatus = async (
  orderId,
  userId,
  newStatus,
  userRoles,
  note = ""
) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw handleNotFoundError(
        "Order",
        "ORDER_NOT_FOUND",
        "update_order_status",
        {
          orderId,
        }
      );
    }

    const currentStatus = order.status;
    if (!OrderValidator.isValidStatusTransition(currentStatus, newStatus)) {
      logger.warn("Invalid status transition attempted", {
        userId,
        orderId,
        currentStatus,
        newStatus,
        action: "update_order_status",
      });
      throw createValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}.`,
        { userId, orderId, currentStatus, newStatus },
        "INVALID_ORDER_STATUS"
      );
    }

    if (!order.canUserModify(userId, userRoles)) {
      logger.warn("User does not have permission to modify this order", {
        userId,
        orderId,
        newStatus,
        action: "update_order_status",
      });
      throw createForbiddenError(
        "You do not have permission to modify this order",
        "UPDATE_ORDER_FORBIDDEN",
        "update_order_status",
        { userId, orderId }
      );
    }

    order.updateStatus(newStatus, note, userId);
    await order.save();
    await handleStatusSideEffects(order, newStatus);

    // Convert address enum keys to values for client response
    const orderObj = order.toObject();
    if (orderObj.deliveryAddress) {
      orderObj.deliveryAddress = convertAddressEnumsToValues(
        orderObj.deliveryAddress
      );
    }

    return orderObj;
  } catch (error) {
    return handleServiceError(error, "updateOrderStatus", {
      orderId,
      userId,
      userRoles,
      newStatus,
    });
  }
};

const cancelOrder = async (orderId, userId, reason, description = "") => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw handleNotFoundError("Order", "ORDER_NOT_FOUND", "cancel_order", {
        userId,
        orderId,
      });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      logger.info(
        `Order ${orderId} cannot be cancelled as it is in '${order.status}' status.`,
        { userId, orderId, currentStatus: order.status, action: "cancel_order" }
      );
      throw createValidationError(
        `Order cannot be cancelled as it is already '${order.status}'.`,
        { userId, orderId, currentStatus: order.status },
        "INVALID_ORDER_STATUS"
      );
    }

    // TODO: Recheck the cancelation rules
    const isBuyer = String(order?.buyer?.userId) === String(userId);
    const isSeller = String(order?.seller?.userId) === String(userId);
    const canBuyerCancel = order?.status === "pending";
    const canSellerCancel = new Set(["pending", "confirmed"]).has(
      order?.status
    );

    const canCancel =
      (isBuyer && canBuyerCancel) || (isSeller && canSellerCancel);
    if (!canCancel) {
      throw createForbiddenError(
        "You don't have permission to cancel this order",
        "CANCEL_ORDER_FORBIDDEN"
      );
    }

    // Restore stock only for products, not services
    // For newer orders, the type is stored in the order item
    // For older orders, fetch it from listings
    const itemsNeedingTypeCheck = order.items.filter((item) => !item.type);

    let listingTypeMap = new Map();
    if (itemsNeedingTypeCheck.length > 0) {
      const listingIds = itemsNeedingTypeCheck.map((item) => item.listingId);
      const listings = await Listing.find({ _id: { $in: listingIds } }).select(
        "type"
      );
      listingTypeMap = new Map(
        listings.map((listing) => [listing._id.toString(), listing.type])
      );
    }

    const stockRestorations = order.items
      .filter((item) => {
        // Use stored type if available, otherwise fetch from map
        const itemType =
          item.type || listingTypeMap.get(item.listingId.toString());
        return itemType === "product"; // Only restore stock for products
      })
      .map((item) => {
        if (item.variantId) {
          // Restore variant stock using the model method
          return Listing.findById(item.listingId).then((listing) => {
            if (listing) {
              return listing.restoreVariantStock(item.variantId, item.quantity);
            }
          });
        } else {
          // Restore listing stock directly
          return Listing.findByIdAndUpdate(
            item.listingId,
            { $inc: { stock: item.quantity } },
            { new: true }
          );
        }
      });

    if (stockRestorations.length > 0) {
      await Promise.all(stockRestorations);
    }

    // Update status (modifies order in place)
    order.updateStatus(
      "cancelled",
      `Reason: ${reason}. ${description}`,
      userId
    );

    // Save the order
    await order.save();

    logger.info("Order cancelled successfully", {
      orderId,
      userId,
      reason,
      restoredItems: order.items.length,
      action: "cancel_order",
    });

    // Convert address enum keys to values for client response
    const orderObj = order.toObject();
    if (orderObj.deliveryAddress) {
      orderObj.deliveryAddress = convertAddressEnumsToValues(
        orderObj.deliveryAddress
      );
    }

    return orderObj;
  } catch (error) {
    return handleServiceError(error, "cancelOrder", { orderId, userId });
  }
};

const getOrdersByStatus = async (status, options = {}) => {
  try {
    const {
      page = 1,
      limit = Math.min(options.limit || 50, 100),
      sort: sortQuery,
      fields,
    } = options;

    const query = { status };

    const sort = buildSort({ sort: sortQuery }, ["createdAt", "totalAmount"]);

    let selectFields = "";
    if (fields) {
      selectFields = buildSelect(fields);
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .select(selectFields)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(),
      Order.countDocuments(query),
    ]);

    // Convert address enum keys to values for client response
    const convertedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      if (orderObj.deliveryAddress) {
        orderObj.deliveryAddress = convertAddressEnumsToValues(
          orderObj.deliveryAddress
        );
      }
      return orderObj;
    });

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      limit,
    };

    return { orders: convertedOrders, pagination, total };
  } catch (error) {
    return handleServiceError(error, "getOrdersByStatus", { status });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getOrdersByStatus,
};
