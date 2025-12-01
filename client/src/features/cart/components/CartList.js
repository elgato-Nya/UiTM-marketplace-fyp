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

  return (
    <Box
      component="section"
      aria-label="Cart items"
      role="list"
      aria-live="polite"
    >
      {items.map((item) => (
        <CartItem
          key={item._id || item.listing._id}
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
