import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Avatar,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../../hooks/useTheme";
import { useSnackbarContext as useSnackbar } from "../../../contexts/SnackbarContext";
import { useAuth } from "../../auth/hooks/useAuth";
import { CATEGORY_LABELS } from "../../../constants/listingConstant";
import AddToCartDialog from "../../cart/components/AddToCartDialog";
import useCart from "../../cart/hook/useCart";
import useWishlist from "../../wishlist/hook/useWishlist";

/**
 * ListingListItem Component
 *
 * PURPOSE: Display listing in horizontal list format (mobile-optimized)
 * USAGE: Used in mobile view for better scrolling experience
 */
const ListingListItem = ({ listing, isWishlistContext = false }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { success, error: showError } = useSnackbar();
  const { isAuthenticated } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { isInCart, addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const {
    _id,
    name,
    description,
    price,
    category,
    type,
    images,
    stock,
    isFree,
    isAvailable,
    seller,
  } = listing;

  const isService = type === "service";
  const isProduct = type === "product";
  const isOutOfStock = isProduct && stock <= 0;
  const canAddToCart = isAvailable && (isService || !isOutOfStock);
  const inCart = isInCart(_id);
  const inWishlist = isInWishlist(_id);
  const primaryImage = images?.[0];
  const imageSrc =
    typeof primaryImage === "string"
      ? primaryImage
      : primaryImage?.url || "https://via.placeholder.com/150";
  const sellerUser = seller?.userId || seller || {};
  const sellerMerchant = sellerUser?.merchantDetails || {};
  const sellerDisplayName =
    sellerMerchant.shopName ||
    seller?.shopName ||
    sellerUser?.shopName ||
    sellerUser?.username ||
    seller?.username ||
    "Seller";
  const isSellerVerified = Boolean(
    sellerUser?.isVerifiedMerchant ||
      seller?.isVerifiedMerchant ||
      sellerMerchant?.verificationStatus === "verified",
  );

  // Format price with spaces (e.g., 1 234 567.89)
  const formatPrice = (price) => {
    if (isFree) return "FREE";
    if (price >= 100000) {
      // Use prefix for 100k+
      if (price >= 1000000000) {
        return `RM${(price / 1000000000).toFixed(1)}b`;
      }
      if (price >= 1000000) {
        return `RM${(price / 1000000).toFixed(1)}m`;
      }
      return `RM${(price / 1000).toFixed(1)}k`;
    }
    // Format with spaces for numbers < 100k
    const parts = price.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `RM${parts.join(".")}`;
  };

  // Format stock with prefix for large numbers
  const formatStock = (stock) => {
    if (stock === 0) return "Out";
    if (stock >= 1000000) {
      return `${(stock / 1000000).toFixed(1)}m stock`;
    }
    if (stock >= 1000) {
      return `${(stock / 1000).toFixed(1)}k stock`;
    }
    return `${stock} stock`;
  };

  const handleCardClick = () => {
    navigate(`/listings/${_id}`);
  };

  const handleAddToCartClick = (event) => {
    event.stopPropagation();
    if (isService && inCart) {
      showError("This service is already in your cart");
      return;
    }
    setDialogOpen(true);
  };

  const handleWishlistClick = async (event) => {
    event.stopPropagation();
    try {
      if (inWishlist) {
        await removeFromWishlist(_id);
        success("Removed from wishlist");
      } else {
        await addToWishlist(_id);
        success("Added to wishlist");
      }
    } catch (error) {
      showError(error.message || "Failed to update wishlist");
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleConfirmAddToCart = async (quantity) => {
    try {
      await addToCart(_id, quantity);
      success(`${isService ? "Service" : "Product"} added to cart`);
      handleCloseDialog();
    } catch (error) {
      showError(error.message || "Failed to add to cart");
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        sx={{
          display: "flex",
          cursor: "pointer",
          transition: "all 0.3s ease",
          opacity: !isAvailable ? 0.6 : 1,
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[4],
          },
          minHeight: 132,
        }}
      >
        {/* Image */}
        <Box
          component="img"
          src={imageSrc}
          alt={name}
          sx={{
            width: { xs: 110, sm: 124 },
            aspectRatio: "4 / 3",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />

        {/* Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              flex: 1,
              p: 1.5,
              "&:last-child": { pb: 1.5 },
              overflow: "hidden",
            }}
          >
            {/* Type Badge */}
            <Box sx={{ mb: 0.25 }}>
              <Chip
                label={type === "product" ? "Product" : "Service"}
                size="small"
                color={type === "product" ? "primary" : "secondary"}
                sx={{ minHeight: 18, fontSize: "0.7rem" }}
              />
            </Box>

            {/* Title */}
            <Typography
              variant="subtitle2"
              component="h3"
              sx={{
                fontWeight: 600,
                mb: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.3,
              }}
            >
              {name}
            </Typography>

            {/* Category/Description */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
              }}
            >
              {CATEGORY_LABELS[category] || category}
            </Typography>

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ mb: 0.5, minWidth: 0 }}
            >
              <Avatar
                sx={{
                  width: 18,
                  height: 18,
                  fontSize: "0.7rem",
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                }}
              >
                {sellerDisplayName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                  flex: 1,
                }}
                title={sellerDisplayName}
              >
                {sellerDisplayName}
              </Typography>
              {isSellerVerified && (
                <Chip
                  label="Verified"
                  size="small"
                  color="success"
                  variant="outlined"
                  aria-label="Verified merchant"
                  sx={{
                    minHeight: 18,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    "& .MuiChip-label": { px: 0.6 },
                  }}
                />
              )}
            </Stack>

            {/* Price and Actions Row */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: "auto" }}
            >
              {/* Price */}
              <Typography
                variant="h6"
                component="span"
                color="primary"
                sx={{
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "60%",
                  flexShrink: 1,
                }}
              >
                {formatPrice(price)}
              </Typography>

              {/* Actions */}
              <Stack direction="row" spacing={0.5}>
                {/* Wishlist Button - Only show for authenticated users */}
                {isAuthenticated && (
                  <IconButton
                    size="small"
                    onClick={handleWishlistClick}
                    aria-label={
                      inWishlist
                        ? `Remove ${name} from wishlist`
                        : `Add ${name} to wishlist`
                    }
                    sx={{
                      color: inWishlist
                        ? theme.palette.error.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {inWishlist ? (
                      <FavoriteIcon fontSize="small" />
                    ) : (
                      <FavoriteBorderIcon fontSize="small" />
                    )}
                  </IconButton>
                )}

                {/* Add to Cart Button - Only show for authenticated users */}
                {isAuthenticated && canAddToCart && (
                  <IconButton
                    size="small"
                    onClick={handleAddToCartClick}
                    disabled={!isService && inCart}
                    aria-label={`Add ${name} to cart`}
                    sx={{
                      color: !isService && inCart
                        ? theme.palette.success.main
                        : theme.palette.primary.main,
                    }}
                  >
                    <ShoppingCartIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Stack>

            {/* Stock Info for Products */}
            {type === "product" && stock !== undefined && (
              <Typography
                variant="caption"
                color={stock === 0 ? "error" : "text.secondary"}
                sx={{
                  display: "block",
                  mt: 0.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {formatStock(stock)}
              </Typography>
            )}

            {/* Unavailable Badge */}
            {!isAvailable && (
              <Chip
                label="Unavailable"
                size="small"
                color="error"
                variant="outlined"
                sx={{ mt: 0.5, minHeight: 20, fontSize: "0.75rem" }}
              />
            )}
          </CardContent>
        </Box>
      </Card>

      {/* Add to Cart Dialog */}
      <AddToCartDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        listing={listing}
        onConfirm={handleConfirmAddToCart}
      />
    </>
  );
};

export default ListingListItem;
