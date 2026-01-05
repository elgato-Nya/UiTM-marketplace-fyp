import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  ButtonGroup,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../../hooks/useTheme";
import PriceChangeIndicator from "./PriceChangeIndicator";

const CartItem = ({
  item,
  onQuantityDecrease,
  onQuantityIncrease,
  onRemove,
  onMoveToWishlist,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState(null);

  const listing = item.listing;

  // Handle null/deleted listings - Professional minimalist design
  if (!listing) {
    return (
      <Card
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          p: 2.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "error.main",
          bgcolor: "error.lighter",
          boxShadow: "0 2px 8px rgba(211, 47, 47, 0.08)",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "error.main",
              }}
            />
            <Typography variant="subtitle2" fontWeight={600} color="error.main">
              Item No Longer Available
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 3.5 }}>
            This listing has been removed by the seller or is no longer
            available.
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={async () => {
            setLoadingAction("remove");
            try {
              await onRemove(item._id);
            } catch (error) {
              console.error("Error removing item:", error);
            } finally {
              setLoadingAction(null);
            }
          }}
          disabled={isLoading || loadingAction === "remove"}
          sx={{
            ml: 2,
            "&:hover": {
              bgcolor: "error.main",
              color: "white",
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Card>
    );
  }

  const currentPrice = listing.price;
  const priceWhenAdded = item.priceWhenAdded;
  const quantity = item.quantity;
  const maxStock = listing.stock || 0;
  const isAvailable = listing.isAvailable;
  const listingType = listing.type || "product";
  const isService = listingType === "service";
  const isOutOfStock = !isService && maxStock === 0;

  // Variant support
  const hasVariant = !!item.variantId || !!item.variantSnapshot;
  const variantSnapshot = item.variantSnapshot;
  const effectivePrice =
    hasVariant && variantSnapshot?.price ? variantSnapshot.price : currentPrice;
  const effectiveStock =
    hasVariant && variantSnapshot?.stock !== undefined
      ? variantSnapshot.stock
      : maxStock;
  const variantOutOfStock = hasVariant && effectiveStock === 0;

  const handleQuantityChange = async (action) => {
    setLoadingAction(action);
    try {
      if (action === "increase") {
        await onQuantityIncrease(
          listing._id,
          quantity,
          hasVariant ? effectiveStock : maxStock,
          item.variantId
        );
      }
      if (action === "decrease") {
        await onQuantityDecrease(listing._id, quantity, item.variantId);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemove = async () => {
    setLoadingAction("remove");
    try {
      await onRemove(item._id); // Use cart item ID, not listing ID
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMoveToWishlist = async () => {
    setLoadingAction("wishlist");
    try {
      await onMoveToWishlist(listing._id);
    } catch (error) {
      console.error("Error moving item to wishlist:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const goToListing = () => {
    // Navigate to listing detail page
    if (listing && listing._id) {
      navigate(`/listings/${listing._id}`);
    } else {
      navigate(`/listings`);
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "row",
        mb: 2,
        minHeight: 200,
        opacity: !isAvailable ? 0.5 : isOutOfStock ? 0.65 : 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: isOutOfStock ? "warning.main" : "divider",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s ease",
      }}
    >
      {/* Out of Stock Overlay Badge */}
      {isOutOfStock && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
            bgcolor: "warning.main",
            color: "warning.contrastText",
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontWeight: 600,
            fontSize: "0.75rem",
            boxShadow: "0 2px 8px rgba(237, 108, 2, 0.3)",
          }}
        >
          OUT OF STOCK
        </Box>
      )}
      <CardMedia
        component="img"
        sx={{
          width: 140,
          height: 200,
          objectFit: "cover",
          cursor: "pointer",
          flexShrink: 0,
        }}
        image={listing.images?.[0] || "/placeholder-image.png"}
        alt={listing.name}
        onClick={goToListing}
      />

      <Box
        sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}
      >
        <CardContent sx={{ flex: 1, pb: 1 }}>
          {!isAvailable && (
            <Chip
              label="Unavailable"
              color="error"
              size="small"
              sx={{ mb: 1 }}
            />
          )}

          <Typography
            variant="h6"
            sx={{
              cursor: "pointer",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: 0.5,
              fontWeight: 600,
              lineHeight: 1.3,
              wordBreak: "break-word",
            }}
            onClick={goToListing}
          >
            {listing.name}
          </Typography>

          {/* Variant Info */}
          {hasVariant && variantSnapshot && (
            <Box sx={{ mb: 1 }}>
              <Chip
                label={
                  variantSnapshot.attributes &&
                  Object.keys(variantSnapshot.attributes).length > 0
                    ? Object.values(variantSnapshot.attributes).join(" - ")
                    : variantSnapshot.name
                }
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.75rem" }}
              />
            </Box>
          )}

          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              RM{effectivePrice.toFixed(2)}
            </Typography>

            {priceWhenAdded !== effectivePrice && (
              <Box sx={{ mt: 0.5 }}>
                <PriceChangeIndicator
                  originalPrice={priceWhenAdded}
                  currentPrice={effectivePrice}
                  showLabel={true}
                />
              </Box>
            )}
          </Box>

          {/* Stock warning - Products only */}
          {!isService &&
            isAvailable &&
            !hasVariant &&
            maxStock > 0 &&
            maxStock < 5 && (
              <Typography variant="caption" color="error" fontWeight={600}>
                Only {maxStock} left in stock
              </Typography>
            )}

          {/* Variant stock warning */}
          {!isService &&
            isAvailable &&
            hasVariant &&
            effectiveStock > 0 &&
            effectiveStock < 5 && (
              <Typography variant="caption" color="error" fontWeight={600}>
                Only {effectiveStock} left in stock
              </Typography>
            )}

          {/* Out of stock warning - Products only */}
          {!isService && isAvailable && maxStock === 0 && (
            <Typography variant="caption" color="error" fontWeight={600}>
              Out of stock
            </Typography>
          )}
        </CardContent>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            px: 2,
            pb: 2,
          }}
        >
          {/* Quantity Controls - Only for products */}
          {!isService && (
            <ButtonGroup size="small" disabled={!isAvailable || isLoading}>
              <Button
                onClick={() => handleQuantityChange("decrease")}
                disabled={quantity <= 1 || loadingAction === "decrease"}
                sx={{ minWidth: 36 }}
              >
                <RemoveIcon fontSize="small" />
              </Button>
              <Button disabled sx={{ minWidth: 50, fontWeight: 600 }}>
                {quantity}
              </Button>
              <Button
                onClick={() => handleQuantityChange("increase")}
                disabled={
                  quantity >= (hasVariant ? effectiveStock : maxStock) ||
                  loadingAction === "increase"
                }
                sx={{ minWidth: 36 }}
              >
                <AddIcon fontSize="small" />
              </Button>
            </ButtonGroup>
          )}

          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.info.main,
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              RM{(effectivePrice * (isService ? 1 : quantity)).toFixed(2)}
            </Typography>

            <Tooltip title="Move to wishlist">
              <IconButton
                size="small"
                onClick={handleMoveToWishlist}
                disabled={isLoading || loadingAction === "wishlist"}
              >
                <FavoriteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove from cart">
              <IconButton
                size="small"
                onClick={handleRemove}
                disabled={isLoading || loadingAction === "remove"}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CartItem;
