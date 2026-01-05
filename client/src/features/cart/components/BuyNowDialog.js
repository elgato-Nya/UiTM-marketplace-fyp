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
  Divider,
  Chip,
  Alert,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  ShoppingBag as BuyNowIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

import VariantAttributeSelector from "../../listing/components/variants/VariantAttributeSelector";

/**
 * BuyNowDialog Component
 *
 * Dialog for selecting variant and proceeding to checkout
 * Uses attribute-based variant selection (Color → Size)
 *
 * @param {boolean} open - Controls dialog visibility
 * @param {function} onClose - Callback when dialog closes
 * @param {object} listing - The listing object
 * @param {object} selectedVariant - Pre-selected variant (optional)
 * @param {function} onBuyNow - Callback when user confirms purchase
 */
const BuyNowDialog = ({
  open,
  onClose,
  listing,
  selectedVariant: initialSelectedVariant = null,
  onBuyNow,
}) => {
  const [internalSelectedVariant, setInternalSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(false);

  // Destructure listing properties
  const { name, price, images, variants = [] } = listing || {};

  // Check if listing has variants with attributes
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
      setLoading(false);
    } else {
      setInternalSelectedVariant(null);
    }
  }, [open, initialSelectedVariant]);

  // Determine effective price based on variant
  const effectivePrice = selectedVariant ? selectedVariant.price : price;

  // Get display image
  const displayImage = useMemo(() => {
    if (selectedVariant?.image) return selectedVariant.image;
    if (images?.length > 0) {
      return typeof images[0] === "string" ? images[0] : images[0]?.url;
    }
    return null;
  }, [selectedVariant, images]);

  // Check if can proceed
  const canProceed = hasVariants
    ? selectedVariant && selectedVariant.isAvailable !== false
    : true;

  // ========== Event Handlers ==========

  const handleClose = () => {
    setInternalSelectedVariant(null);
    setLoading(false);
    onClose();
  };

  const handleVariantSelect = (variant) => {
    setInternalSelectedVariant(variant);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant && hasVariants) return;

    setLoading(true);
    try {
      await onBuyNow(selectedVariant);
    } catch (error) {
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
          <BuyNowIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            Buy Now
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
          <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
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
              Total
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              fontWeight={700}
              sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
            >
              {formatPrice(effectivePrice)}
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
          onClick={handleBuyNow}
          variant="contained"
          size="medium"
          sx={{ flex: 2, py: { xs: 0.75, sm: 1 } }}
          disabled={loading || !canProceed}
          startIcon={
            loading ? (
              <CircularProgress size={16} />
            ) : (
              <BuyNowIcon fontSize="small" />
            )
          }
        >
          {loading
            ? "Processing..."
            : !canProceed
              ? hasVariants && !selectedVariant
                ? "Select Options"
                : "Unavailable"
              : "Checkout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuyNowDialog;
