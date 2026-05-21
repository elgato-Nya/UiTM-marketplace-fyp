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
import { getPrimaryOptionImageUrl } from "../../listing/utils/variantImage";

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
  selectedAttributes: initialSelectedAttributes,
  isWishlistContext = false,
}) => {
  const { success, error: showError } = useSnackbar();
  const { addToCart, getCartItem } = useCart();
  const { moveToCart } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [internalSelectedVariant, setInternalSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});

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
  const selectedVariant = internalSelectedVariant;
  const seededSelectedAttributes =
    initialSelectedAttributes &&
    Object.keys(initialSelectedAttributes).length > 0
      ? initialSelectedAttributes
      : initialSelectedVariant?.attributes || {};

  // Reset when dialog opens/closes
  useEffect(() => {
    if (open) {
      setInternalSelectedVariant(initialSelectedVariant);
      setSelectedAttributes(seededSelectedAttributes);
      setQuantity(1);
    } else {
      setInternalSelectedVariant(null);
      setSelectedAttributes({});
    }
  }, [open, initialSelectedVariant, seededSelectedAttributes]);

  // Determine effective price and stock based on variant
  const effectivePrice = selectedVariant ? selectedVariant.price : price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : stock;

  // Get display image
  const displayImage = useMemo(() => {
    const primaryOptionImageUrl = getPrimaryOptionImageUrl(
      listing,
      selectedAttributes,
      selectedVariant
    );

    if (primaryOptionImageUrl) return primaryOptionImageUrl;
    if (selectedVariant?.image) return selectedVariant.image;
    if (images?.length > 0) {
      return typeof images[0] === "string" ? images[0] : images[0]?.url;
    }
    return null;
  }, [listing, selectedAttributes, selectedVariant, images]);

  // Determine listing type and constraints
  const isService = type === "service";
  const maxStock = effectiveStock || 0;
  const selectionLabel = selectedVariant
    ? Object.values(selectedAttributes || {}).filter(Boolean).join(" - ") ||
      (selectedVariant.attributes
        ? Object.values(selectedVariant.attributes).join(" - ")
        : selectedVariant.name)
    : Object.values(selectedAttributes || {}).filter(Boolean).join(" - ") || null;

  // Get cart item
  const cartItem = getCartItem(_id, selectedVariant?._id);
  const currentCartQuantity = cartItem?.quantity || 0;
  const availableToAdd = isService ? Infinity : maxStock - currentCartQuantity;

  // Check if can add to cart
  const canAddToCart = hasVariants
    ? selectedVariant && selectedVariant.isAvailable !== false
    : isAvailable && (isService || stock > 0);
  const showQuantityControls =
    !isService && (!hasVariants || Boolean(selectedVariant));
  const statusLabel = isService
    ? "Service"
    : canAddToCart
      ? effectiveStock > 0
        ? `${effectiveStock} in stock`
        : "Available"
      : "Unavailable";

  // ========== Event Handlers ==========

  const handleClose = () => {
    setLoading(false);
    setQuantity(1);
    setInternalSelectedVariant(null);
    onClose();
  };

  const handleVariantSelect = (variant) => {
    setInternalSelectedVariant(variant);
    setQuantity(1);
  };

  const handleSelectionChange = (attributes) => {
    setSelectedAttributes(attributes);

    if (!internalSelectedVariant?.attributes) {
      return;
    }

    const allSelected = Object.values(attributes || {}).every(
      (value) => value !== null && value !== undefined && value !== ""
    );

    const matchesCurrentVariant = Object.entries(attributes || {}).every(
      ([key, value]) => !value || internalSelectedVariant.attributes?.[key] === value
    );

    if (!allSelected || !matchesCurrentVariant) {
      setInternalSelectedVariant(null);
    }
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
      const withTimeout = (promise, ms = 15000) =>
        Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    "Add to cart is taking too long. Please check your connection and try again.",
                  ),
                ),
              ms,
            ),
          ),
        ]);

      if (isService && cartItem) {
        showError("This service is already in your cart");
        return;
      }

      if (isWishlistContext) {
        await withTimeout(moveToCart(_id, qty, selectedVariant?._id));
        handleClose();
        setTimeout(() => success(`Item moved to cart!`), 300);
      } else {
        await withTimeout(addToCart(_id, qty, selectedVariant?._id));
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
    } finally {
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
      aria-labelledby="add-to-cart-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 3, sm: 4 },
            maxWidth: { xs: "calc(100% - 20px)", sm: 580 },
            maxHeight: {
              xs: "min(680px, calc(100dvh - 20px))",
              sm: "min(720px, calc(100dvh - 40px))",
            },
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        id="add-to-cart-dialog-title"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          py: { xs: 1.25, sm: 1.5 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <ShoppingCartIcon fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ lineHeight: 1.2 }}
            >
              Add to Cart
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.25, display: "block" }}
            >
              {hasVariants ? "Select options and confirm." : "Review and confirm."}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Close add to cart dialog"
          sx={{ mt: -0.25, mr: -0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          pt: { xs: 1.5, sm: 2 },
          pb: { xs: 1, sm: 1.5 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 1.5, sm: 2 },
            alignItems: "flex-start",
          }}
        >
          {displayImage && (
            <Box
              component="img"
              src={displayImage}
              alt={name}
              sx={{
                width: { xs: 60, sm: 72 },
                height: { xs: 60, sm: 72 },
                objectFit: "cover",
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
              }}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                fontWeight: 700,
              }}
            >
              {isWishlistContext ? "Move to cart" : "Cart item"}
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.35,
                mb: 0.4,
              }}
            >
              {name}
            </Typography>
            <Typography
              variant="subtitle1"
              color="primary"
              fontWeight={800}
            >
              {formatPrice(effectivePrice)}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: 0.75 }}>
              <Chip
                label={statusLabel}
                size="small"
                sx={{
                  minHeight: 24,
                  borderRadius: 999,
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                  border: "1px solid",
                  borderColor: "divider",
                  "& .MuiChip-label": {
                    px: 0.9,
                    fontSize: "0.8125rem",
                  },
                }}
              />
              <Chip
                label={isService ? "Service listing" : "Product listing"}
                size="small"
                sx={{
                  minHeight: 24,
                  borderRadius: 999,
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                  border: "1px solid",
                  borderColor: "divider",
                  "& .MuiChip-label": {
                    px: 0.9,
                    fontSize: "0.8125rem",
                  },
                }}
              />
            </Box>
            {selectionLabel && (
              <Chip
                label={selectionLabel}
                size="small"
                color="primary"
                variant="outlined"
                icon={<CheckIcon sx={{ fontSize: 14 }} />}
                sx={{
                  mt: 0.75,
                  height: "auto",
                  minHeight: 24,
                  maxWidth: "100%",
                  "& .MuiChip-label": {
                    display: "block",
                    whiteSpace: "normal",
                    py: 0.25,
                    fontSize: "0.8125rem",
                  },
                }}
              />
            )}
          </Box>
        </Box>

        {hasAttributeVariants && (
          <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 0.25 }}
            >
              Choose options
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: "block" }}
            >
              Select the combination you want before adding it to your cart.
            </Typography>
            {!selectedVariant && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mb: 1,
                  display: "block",
                  fontWeight: 600,
                }}
              >
                Options are required before you can add this item.
              </Typography>
            )}
            <VariantAttributeSelector
              variants={variants}
              selectedVariant={selectedVariant}
              selectedAttributes={selectedAttributes}
              onVariantSelect={handleVariantSelect}
              onSelectionChange={handleSelectionChange}
              compact
            />
          </Box>
        )}

        {hasVariants && !hasAttributeVariants && (
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 0.25 }}
            >
              Choose a variant
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: "block" }}
            >
              Pick one option to continue.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
                      fontWeight: isSelected ? 700 : 500,
                      minHeight: 30,
                      borderRadius: 999,
                      border: "1.5px solid",
                      borderColor: isSelected ? "primary.main" : "divider",
                      bgcolor: isSelected
                        ? (t) => alpha(t.palette.primary.main, 0.12)
                        : "transparent",
                      color: isSelected ? "primary.main" : "text.primary",
                      "& .MuiChip-label": {
                        px: 1,
                        fontSize: "0.8125rem",
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {showQuantityControls && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              px: { xs: 1.5, sm: 2 },
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              mb: 1.5,
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={700}>
                Quantity
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {availableToAdd > 0
                  ? `${availableToAdd} available to add`
                  : "No more stock available"}
              </Typography>
            </Box>
            <ButtonGroup variant="outlined" size="small">
              <Button
                onClick={handleDecrease}
                disabled={quantity <= 1 || loading}
                sx={{ minWidth: 36, borderRadius: 1.5 }}
              >
                <RemoveIcon fontSize="small" />
              </Button>
              <Button disabled sx={{ minWidth: 44, fontWeight: 700 }}>
                {quantity}
              </Button>
              <Button
                onClick={handleIncrease}
                disabled={quantity >= availableToAdd || loading}
                sx={{ minWidth: 36, borderRadius: 1.5 }}
              >
                <AddIcon fontSize="small" />
              </Button>
            </ButtonGroup>
          </Box>
        )}

        <Box
          sx={{
            py: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              {isService ? "Price" : "Total"}
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              fontWeight={800}
            >
              RM{isService ? effectivePrice.toFixed(2) : totalPrice}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 2.5 },
          pt: { xs: 0.75, sm: 1 },
        }}
      >
        <Button
          onClick={handleAddToCart}
          variant="contained"
          size="large"
          sx={{
            width: "100%",
            py: 1.1,
            borderRadius: 2,
            fontWeight: 700,
            boxShadow: "none",
            "&.Mui-disabled": {
              bgcolor: "action.disabledBackground",
              color: "text.disabled",
            },
          }}
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
