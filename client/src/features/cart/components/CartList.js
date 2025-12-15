import { Box } from "@mui/material";

import CartItem from "./CartItem";

const CartList = ({
  items = [],
  onQuantityDecrease,
  onQuantityIncrease,
  onRemove,
  onMoveToWishlist,
  isLoading = false,
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  // Sort items: null listings first, then out of stock, then available
  const sortedItems = [...items].sort((a, b) => {
    // Null listings at the top
    if (!a.listing && b.listing) return -1;
    if (a.listing && !b.listing) return 1;
    if (!a.listing && !b.listing) return 0;

    // Out of stock items second
    const aOutOfStock =
      a.listing.type === "product" && (a.listing.stock || 0) === 0;
    const bOutOfStock =
      b.listing.type === "product" && (b.listing.stock || 0) === 0;

    if (aOutOfStock && !bOutOfStock) return -1;
    if (!aOutOfStock && bOutOfStock) return 1;

    // Otherwise maintain original order
    return 0;
  });

  return (
    <Box
      component="section"
      aria-label="Cart items"
      role="list"
      aria-live="polite"
    >
      {sortedItems.map((item) => (
        <CartItem
          key={item._id || item.listing?._id || Math.random()}
          item={item}
          onQuantityDecrease={onQuantityDecrease}
          onQuantityIncrease={onQuantityIncrease}
          onRemove={onRemove}
          onMoveToWishlist={onMoveToWishlist}
          isLoading={isLoading}
        />
      ))}
    </Box>
  );
};

export default CartList;
