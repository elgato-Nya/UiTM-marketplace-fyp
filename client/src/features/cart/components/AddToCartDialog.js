import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  ButtonGroup,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";

import { useSnackbarContext as useSnackbar } from "../../../contexts/SnackbarContext";
import useCart from "../hook/useCart";
import useWishlist from "../../wishlist/hook/useWishlist";

/**
 * AddToCartDialog Component
 *
 * Confirmation dialog for adding items to cart
 * - Products: Shows quantity selector with stock validation
 * - Services: Shows confirmation only (no quantity needed)
 *
 * @param {boolean} open - Controls dialog visibility
 * @param {function} onClose - Callback when dialog closes
 * @param {object} listing - The listing object to add
 * @param {boolean} isWishlistContext - If true, uses moveToCart (removes from wishlist)
 */
const AddToCartDialog = ({
  open,
  onClose,
  listing,
  isWishlistContext = false,
}) => {
  const { success, error: showError } = useSnackbar();
  const { addToCart, getCartItem } = useCart();
  const { moveToCart } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Destructure listing properties
  const { _id, name, description, price, type, images, stock, isAvailable } =
    listing || {};

  // Determine listing type and constraints
  const isService = type === "service";
  const maxStock = stock || 0;
  const cartItem = getCartItem(_id);
  const currentCartQuantity = cartItem?.quantity || 0;
  const availableToAdd = isService ? Infinity : maxStock - currentCartQuantity;

  // ========== Event Handlers ==========

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (isService) {
      setQuantity(quantity + 1); // No limit for services (not used anyway)
    } else if (quantity < availableToAdd) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Services always use quantity 1, products use selected quantity
      const qty = isService ? 1 : quantity;

      // Check if service is already in cart before attempting
      if (isService && cartItem) {
        showError("This service is already in your cart");
        setLoading(false);
        return;
      }

      if (isWishlistContext) {
        // Move from wishlist to cart (removes from wishlist + adds to cart)
        await moveToCart(_id, qty);
        // Close dialog before showing success message
        handleClose();
        setTimeout(() => success(`Item moved to cart!`), 300);
      } else {
        // Regular add to cart
        await addToCart(_id, qty);
        // Close dialog before showing success message
        handleClose();
        setTimeout(() => {
          success(
            `Added ${isService ? "service" : `${qty} ${qty > 1 ? "items" : "item"} to cart!`}`
          );
        }, 300);
      }
    } catch (error) {
      // Show error message without closing dialog
      showError(error.message || "Failed to add to cart");
      setLoading(false);
    }
  };

  // ========== Early Return ==========

  if (!listing) return null;

  // ========== Computed Values ==========

  const imageUrl =
    images && images.length > 0
      ? typeof images[0] === "string"
        ? images[0]
        : images[0]?.url
      : null;

  const totalPrice = (price * quantity).toFixed(2);
  const newTotalInCart = currentCartQuantity + quantity;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShoppingCartIcon color="primary" />
          <Typography variant="h6" component="span" fontWeight={600}>
            Add to Cart
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Content */}
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          {/* Image */}
          {imageUrl && (
            <Box
              component="img"
              src={imageUrl}
              alt={name}
              sx={{
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          )}

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                mb: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {name}
            </Typography>

            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {description}
              </Typography>
            )}

            <Typography variant="h6" color="primary" fontWeight={700}>
              RM{price.toFixed(2)}
            </Typography>

            {/* Stock Info - Products only */}
            {!isService && stock !== undefined && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: stock < 5 ? "error.main" : "text.secondary",
                }}
              >
                {stock} available in stock
              </Typography>
            )}

            {/* Service label */}
            {isService && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: "success.main",
                  fontWeight: 500,
                }}
              >
                Service - No quantity limit
              </Typography>
            )}

            {currentCartQuantity > 0 && (
              <Typography
                variant="body2"
                sx={{ mt: 0.5, color: "info.main", fontWeight: 500 }}
              >
                Already in cart: {currentCartQuantity} item(s)
              </Typography>
            )}
          </Box>
        </Box>

        {/* Quantity Selector - Only for products AND not in wishlist context */}
        {!isService && (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Quantity
              </Typography>

              <ButtonGroup variant="outlined" size="medium">
                <Button
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || loading}
                  sx={{ minWidth: 40 }}
                >
                  <RemoveIcon />
                </Button>
                <Button disabled sx={{ minWidth: 60, fontWeight: 600 }}>
                  {quantity}
                </Button>
                <Button
                  onClick={handleIncrease}
                  disabled={quantity >= availableToAdd || loading}
                  sx={{ minWidth: 40 }}
                >
                  <AddIcon />
                </Button>
              </ButtonGroup>
            </Box>

            {/* Available to add warning */}
            {availableToAdd < maxStock && (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ display: "block", mt: 1, textAlign: "center" }}
              >
                You can add {availableToAdd} more (already have{" "}
                {currentCartQuantity} in cart)
              </Typography>
            )}
          </>
        )}

        {/* Summary */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Price {!isService && "per item"}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              RM{price.toFixed(2)}
            </Typography>
          </Box>

          {!isService && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Quantity
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {quantity}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {isService || isWishlistContext ? "Price" : "Subtotal"}
            </Typography>
            <Typography variant="h6" color="primary" fontWeight={700}>
              RM{isService || isWishlistContext ? price.toFixed(2) : totalPrice}
            </Typography>
          </Box>

          {!isService && currentCartQuantity > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "right" }}
            >
              New cart total: {newTotalInCart} item(s)
            </Typography>
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          fullWidth
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddToCart}
          variant="contained"
          fullWidth
          disabled={loading}
          startIcon={<ShoppingCartIcon />}
        >
          {loading
            ? isWishlistContext
              ? "Moving..."
              : "Adding..."
            : isWishlistContext
              ? "Move to Cart"
              : "Add to Cart"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AddToCartDialog;
