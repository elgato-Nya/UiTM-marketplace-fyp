import { useState, useEffect, useMemo } from "react";
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
  Chip,
  Alert,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

import { useSnackbarContext as useSnackbar } from "../../../contexts/SnackbarContext";
import useCart from "../hook/useCart";
import useWishlist from "../../wishlist/hook/useWishlist";
import VariantAttributeSelector from "../../listing/components/variants/VariantAttributeSelector";

/**
 * AddToCartDialog Component
 *
 * Confirmation dialog for adding items to cart
 * - Products: Shows quantity selector with stock validation
 * - Services: Shows confirmation only (no quantity needed)
 * - Supports attribute-based variant selection (Color → Size)
 *
 * @param {boolean} open - Controls dialog visibility
 * @param {function} onClose - Callback when dialog closes
 * @param {object} listing - The listing object to add
 * @param {object} selectedVariant - Pre-selected variant (optional)
 * @param {boolean} isWishlistContext - If true, uses moveToCart
 */
const AddToCartDialog = ({
  open,
  onClose,
  listing,
  selectedVariant: initialSelectedVariant = null,
  isWishlistContext = false,
}) => {
  const { success, error: showError } = useSnackbar();
  const { addToCart, getCartItem } = useCart();
  const { moveToCart } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [internalSelectedVariant, setInternalSelectedVariant] = useState(null);

  // Destructure listing properties
  const {
    _id,
    name,
    description,
    price,
    type,
    images,
    stock,
    isAvailable,
    variants = [],
  } = listing || {};

  // Check if listing has variants with attributes (for attribute selector)
  const hasVariants = variants && variants.length > 0;
  const hasAttributeVariants = useMemo(() => {
    return (
      hasVariants &&
      variants.some((v) => v.attributes && Object.keys(v.attributes).length > 0)
    );
  }, [hasVariants, variants]);

  // Use internal state for variant selection
  const selectedVariant = initialSelectedVariant || internalSelectedVariant;

  // Reset when dialog opens/closes
  useEffect(() => {
    if (open) {
      setInternalSelectedVariant(initialSelectedVariant);
      setQuantity(1);
    } else {
      setInternalSelectedVariant(null);
    }
  }, [open, initialSelectedVariant]);

  // Determine effective price and stock based on variant
  const effectivePrice = selectedVariant ? selectedVariant.price : price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : stock;

  // Get display image
  const displayImage = useMemo(() => {
    if (selectedVariant?.image) return selectedVariant.image;
    if (images?.length > 0) {
      return typeof images[0] === "string" ? images[0] : images[0]?.url;
    }
    return null;
  }, [selectedVariant, images]);

  // Determine listing type and constraints
  const isService = type === "service";
  const maxStock = effectiveStock || 0;

  // Get cart item
  const cartItem = getCartItem(_id, selectedVariant?._id);
  const currentCartQuantity = cartItem?.quantity || 0;
  const availableToAdd = isService ? Infinity : maxStock - currentCartQuantity;

  // Check if can add to cart
  const canAddToCart = hasVariants
    ? selectedVariant && selectedVariant.isAvailable !== false
    : isAvailable && (isService || stock > 0);

  // ========== Event Handlers ==========

  const handleClose = () => {
    setQuantity(1);
    setInternalSelectedVariant(null);
    onClose();
  };

  const handleVariantSelect = (variant) => {
    setInternalSelectedVariant(variant);
    setQuantity(1);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (isService || quantity < availableToAdd) setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    if (hasVariants && !selectedVariant) {
      showError("Please select a variant first");
      return;
    }

    setLoading(true);
    try {
      const qty = isService ? 1 : quantity;

      if (isService && cartItem) {
        showError("This service is already in your cart");
        setLoading(false);
        return;
      }

      if (isWishlistContext) {
        await moveToCart(_id, qty, selectedVariant?._id);
        handleClose();
        setTimeout(() => success(`Item moved to cart!`), 300);
      } else {
        await addToCart(_id, qty, selectedVariant?._id);
        handleClose();
        setTimeout(() => {
          const variantInfo = selectedVariant
            ? ` (${selectedVariant.name})`
            : "";
          success(
            `Added ${isService ? "service" : `${qty} item${qty > 1 ? "s" : ""}`}${variantInfo} to cart!`
          );
        }, 300);
      }
    } catch (error) {
      showError(error.message || "Failed to add to cart");
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (p) => {
    if (p >= 1000000) return `RM ${(p / 1000000).toFixed(1)}m`;
    if (p >= 100000) return `RM ${(p / 1000).toFixed(1)}k`;
    return `RM ${p.toFixed(2)}`;
  };

  if (!listing) return null;

  const totalPrice = (effectivePrice * quantity).toFixed(2);

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
            maxWidth: { xs: "calc(100% - 32px)", sm: 560 },
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
          py: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShoppingCartIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            Add to Cart
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          pt: { xs: 2, sm: 3 },
          pb: { xs: 1, sm: 2 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Product Info - Compact */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 2, sm: 3 },
          }}
        >
          {displayImage && (
            <Box
              component="img"
              src={displayImage}
              alt={name}
              sx={{
                width: { xs: 72, sm: 96 },
                height: { xs: 72, sm: 96 },
                objectFit: "cover",
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.4,
                mb: 0.75,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {name}
            </Typography>
            <Typography
              variant="subtitle1"
              color="primary"
              fontWeight={700}
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              {formatPrice(effectivePrice)}
            </Typography>
            {selectedVariant && (
              <Chip
                label={
                  selectedVariant.attributes
                    ? Object.values(selectedVariant.attributes).join(" - ")
                    : selectedVariant.name
                }
                size="small"
                color="primary"
                variant="outlined"
                icon={<CheckIcon sx={{ fontSize: 14 }} />}
                sx={{ mt: 0.75, height: 24, fontSize: "0.75rem" }}
              />
            )}
            {isService && (
              <Typography
                variant="caption"
                color="success.main"
                sx={{ display: "block", mt: 0.75 }}
              >
                Service - No quantity limit
              </Typography>
            )}
          </Box>
        </Box>

        {/* Attribute-based Variant Selector */}
        {hasAttributeVariants && (
          <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
            {!selectedVariant && (
              <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }} icon={false}>
                <Typography variant="caption">Select options below</Typography>
              </Alert>
            )}
            <VariantAttributeSelector
              variants={variants}
              selectedVariant={selectedVariant}
              onVariantSelect={handleVariantSelect}
              compact
            />
          </Box>
        )}

        {/* Simple variant list (for variants without attributes) */}
        {hasVariants && !hasAttributeVariants && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ mb: 1, display: "block" }}
            >
              Select Variant
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {variants.map((variant) => {
                const isSelected = variant._id === selectedVariant?._id;
                const isDisabled = variant.isAvailable === false;
                return (
                  <Chip
                    key={variant._id}
                    label={`${variant.name} - ${formatPrice(variant.price)}`}
                    size="small"
                    onClick={() => !isDisabled && handleVariantSelect(variant)}
                    sx={{
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.4 : 1,
                      fontWeight: isSelected ? 600 : 400,
                      border: "1.5px solid",
                      borderColor: isSelected ? "primary.main" : "divider",
                      bgcolor: isSelected
                        ? (t) => alpha(t.palette.primary.main, 0.12)
                        : "transparent",
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* Quantity Selector - Products only */}
        {!isService && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              px: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Quantity
            </Typography>
            <ButtonGroup variant="outlined" size="small">
              <Button
                onClick={handleDecrease}
                disabled={quantity <= 1 || loading}
                sx={{ minWidth: 32 }}
              >
                <RemoveIcon fontSize="small" />
              </Button>
              <Button disabled sx={{ minWidth: 40, fontWeight: 600 }}>
                {quantity}
              </Button>
              <Button
                onClick={handleIncrease}
                disabled={quantity >= availableToAdd || loading}
                sx={{ minWidth: 32 }}
              >
                <AddIcon fontSize="small" />
              </Button>
            </ButtonGroup>
          </Box>
        )}

        {/* Price Summary - Compact */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              {isService ? "Price" : "Total"}
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              fontWeight={700}
              sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
            >
              RM{isService ? effectivePrice.toFixed(2) : totalPrice}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 2.5 },
          pt: { xs: 1, sm: 1.5 },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          size="medium"
          sx={{ flex: 1, py: { xs: 0.75, sm: 1 } }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddToCart}
          variant="contained"
          size="medium"
          sx={{ flex: 2, py: { xs: 0.75, sm: 1 } }}
          disabled={loading || !canAddToCart}
          startIcon={<ShoppingCartIcon fontSize="small" />}
        >
          {loading
            ? "Adding..."
            : !canAddToCart
              ? hasVariants && !selectedVariant
                ? "Select Options"
                : "Unavailable"
              : "Add to Cart"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToCartDialog;
