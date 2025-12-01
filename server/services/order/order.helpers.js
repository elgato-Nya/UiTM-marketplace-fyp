/**
 * Calculate delivery fee based on method and address
 */
const calculateDeliveryFee = (deliveryMethod, deliveryAddress) => {
  const feeStructure = {
    self_pickup: 0,
    campus_delivery: 2,
    room_delivery: 5,
    meetup: 0,
    delivery: 8,
  };

  return feeStructure[deliveryMethod] || 0;
};

/**
 * Calculate estimated delivery date
 */
const calculateEstimatedDelivery = (deliveryMethod) => {
  const baseDays = {
    self_pickup: 0,
    campus_delivery: 1,
    room_delivery: 2,
    meetup: 1,
    delivery: 3,
  };

  const days = baseDays[deliveryMethod] || 3;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + days);

  return estimatedDate;
};

/**
 * Handle side effects when status changes
 */
// TODO: Implement actual side effects like notifications
const handleStatusSideEffects = async (order, newStatus) => {
  switch (newStatus) {
    case "shipped":
      // Could trigger shipping notifications
      break;
    case "delivered":
      // Could trigger delivery confirmations
      break;
    case "completed":
      // Could trigger review requests
      break;
    case "cancelled":
      // Stock restoration handled in cancelOrder
      break;
  }
};

module.exports = {
  calcDeliveryFee: calculateDeliveryFee,
  calcEstimatedDelivery: calculateEstimatedDelivery,
  handleStatusSideEffects,
};
