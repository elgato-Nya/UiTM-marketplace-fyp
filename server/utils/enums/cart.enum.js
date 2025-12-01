const CartLimits = {
  MAX_ITEMS: 50,
  MAX_QUANTITY_PER_ITEM: 999,
  STOCK_LOCK_DURATION: 20, // in minutes
};

const MAX_WISHLIST_ITEMS = 250;

const CartItemStatus = {
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  OUT_OF_STOCK: "out_of_stock",
  LIMITED_STOCK: "limited_stock",
};

module.exports = { CartLimits, MAX_WISHLIST_ITEMS, CartItemStatus };
