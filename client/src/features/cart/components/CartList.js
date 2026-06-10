import { Box } from "@mui/material";

import CartItem from "./CartItem";
import { getCartItemAvailability } from "../utils/cartItemAvailability";

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
    const aOutOfStock = getCartItemAvailability(a).isUnavailableForCheckout;
    const bOutOfStock = getCartItemAvailability(b).isUnavailableForCheckout;

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
      {sortedItems.map((item, index) => {
        const key =
          item._id ||
          item.id ||
          item.cartItemId ||
          item.listingId ||
          (item.listing?._id && item.variantId
            ? `${item.listing._id}:${item.variantId}`
            : item.listing?._id) ||
          `${item.listing?.name || "unknown"}:${item.priceWhenAdded ?? "na"}:${item.quantity ?? "na"}:${index}`;

        return (
          <Box key={key} role="listitem">
            <CartItem
              item={item}
              onQuantityDecrease={onQuantityDecrease}
              onQuantityIncrease={onQuantityIncrease}
              onRemove={onRemove}
              onMoveToWishlist={onMoveToWishlist}
              isLoading={isLoading}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default CartList;
