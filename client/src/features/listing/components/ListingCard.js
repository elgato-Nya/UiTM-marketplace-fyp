import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
  ImageNotSupported as NoImageIcon,
  Storefront as StorefrontIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../../hooks/useTheme";
import { useSnackbarContext as useSnackbar } from "../../../contexts/SnackbarContext";
import { useAuth } from "../../auth/hooks/useAuth";
import { CATEGORY_LABELS } from "../../../constants/listingConstant";
import AddToCartDialog from "../../cart/components/AddToCartDialog";
import useCart from "../../cart/hook/useCart";
import useWishlist from "../../wishlist/hook/useWishlist";

const ListingCard = ({
  listing,
  onEdit,
  onDelete,
  onToggle,
  showActions = false,
  isWishlistContext = false,
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { success, error: showError } = useSnackbar();
  const { isAuthenticated } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { isInCart } = useCart();
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
    variants,
  } = listing;

  // Get lowest price from variants or base price
  const displayPrice = useMemo(() => {
    if (isFree) return 0;
    if (!variants || variants.length === 0) return price;

    // Find lowest priced available variant
    const availableVariants = variants.filter((v) => v.isAvailable !== false);
    if (availableVariants.length === 0) return price;

    const lowestPrice = Math.min(
      ...availableVariants.map((v) => Number(v.price) || 0),
    );
    return lowestPrice > 0 ? lowestPrice : price;
  }, [variants, price, isFree]);

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

  const handleEdit = (event) => {
    event.stopPropagation();
    onEdit?.(_id);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete?.(_id);
  };

  const handleToggle = (event) => {
    event.stopPropagation();
    onToggle?.(_id);
  };

  const handleAddToCartClick = (event) => {
    event.stopPropagation();

    // Check if service is already in cart
    if (isService && inCart) {
      showError("This service is already in your cart");
      return;
    }

    // Open dialog for both products and services (for confirmation)
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleToggleWishlist = async (event) => {
    event.stopPropagation();
    try {
      if (inWishlist) {
        await removeFromWishlist(_id);
        success("Removed from wishlist");
      } else {
        await addToWishlist(_id);
        success("Added to wishlist!");
      }
    } catch (error) {
      showError(error.message || "Failed to update wishlist");
    }
  };

  const hasImages = images && images.length > 0;
  const imageUrl = hasImages
    ? typeof images[0] === "string"
      ? images[0]
      : images[0]?.url
    : null;

  const isService = type === "service";
  const isProduct = type === "product";
  const isOutOfStock = isProduct && stock <= 0;
  const canAddToCart = isAvailable && (isService || !isOutOfStock);
  const inCart = isInCart(_id);
  const inWishlist = isInWishlist(_id);
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

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card
        component="article"
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          backgroundColor: "background.paper",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[8],
            borderColor: theme.palette.primary.main,
          },
          opacity: !isAvailable || isOutOfStock ? 0.7 : 1,
          position: "relative",
          overflow: "hidden",
        }}
        key={_id}
      >
        <CardActionArea
          onClick={handleCardClick}
          aria-label={`View listing: ${name}`}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            flex: 1,
          }}
        >
          <Box
            sx={{
              position: "relative",
              aspectRatio: "4 / 3",
              overflow: "hidden",
              flexShrink: 0,
              bgcolor: hasImages ? "transparent" : "background.default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {hasImages ? (
              <CardMedia
                component="img"
                image={imageUrl}
                alt={name}
                sx={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  color: "text.disabled",
                }}
              >
                <NoImageIcon sx={{ fontSize: 48 }} />
                <Typography variant="caption" color="text.disabled">
                  No Image
                </Typography>
              </Box>
            )}

            {/* Badges Overlay - Left Side */}
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                display: "flex",
                gap: 0.5,
                flexWrap: "wrap",
                maxWidth: { xs: "60%", sm: "calc(100% - 100px)" },
              }}
            >
              {!isAvailable && (
                <Chip
                  label="Unavailable"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(211, 47, 47, 0.92)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  }}
                />
              )}
              {isOutOfStock && (
                <Chip
                  label="Out of Stock"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(237, 108, 2, 0.92)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  }}
                />
              )}
              {isFree && (
                <Chip
                  label="Free"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(46, 125, 50, 0.92)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  }}
                />
              )}
            </Box>

            {/* Type Badge - Right Side */}
            <Box sx={{ position: "absolute", top: 10, right: 10 }}>
              <Chip
                label={
                  isProduct
                    ? "Product"
                    : isService
                      ? "Service"
                      : type || "Unknown"
                }
                size="small"
                variant="filled"
                sx={{
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.main
                      : "rgba(255, 255, 255, 0.95)",
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  border:
                    theme.palette.mode === "dark"
                      ? "none"
                      : `1px solid ${theme.palette.primary.main}`,
                }}
              />
            </Box>
          </Box>

          <CardContent
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? 0.75 : 1,
              pb: 1.25,
              pt: isMobile ? 1.75 : 2,
              px: isMobile ? 1.5 : 2,
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.3,
                minHeight: isMobile
                  ? "calc(0.9rem * 1.3 * 2)"
                  : "calc(1rem * 1.3 * 2)",
                fontSize: isMobile ? "0.9rem" : "1rem",
              }}
              title={name}
            >
              {name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.45,
                minHeight: isMobile
                  ? "calc(0.76rem * 1.45 * 2)"
                  : "calc(0.84rem * 1.45 * 2)",
                fontSize: isMobile ? "0.76rem" : "0.84rem",
              }}
              title={description || "No description"}
            >
              {description || "\u00A0"}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: isMobile ? "0.68rem" : "0.76rem",
                lineHeight: 1.4,
                display: "block",
                maxWidth: "100%",
              }}
              title={CATEGORY_LABELS[category] || category}
            >
              {CATEGORY_LABELS[category] || category}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                flexWrap: "wrap",
                minHeight: 24,
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  minWidth: 0,
                  maxWidth: "100%",
                }}
              >
                <StorefrontIcon
                  sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: isMobile ? "0.68rem" : "0.76rem",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: isMobile ? "130px" : "170px",
                  }}
                  title={sellerDisplayName}
                >
                  {sellerDisplayName}
                </Typography>
              </Box>
              {isSellerVerified && (
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: "0.8rem !important" }} />}
                  label="Verified"
                  size="small"
                  color="success"
                  variant="outlined"
                  aria-label="Verified merchant"
                  sx={{
                    height: 20,
                    fontSize: "0.64rem",
                    fontWeight: 700,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexDirection: "row",
                mt: "auto",
                pt: 0.5,
                gap: 1,
                minWidth: 0,
              }}
            >
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 800,
                  fontSize: isMobile ? "0.92rem" : "1rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: isMobile ? "55%" : "60%",
                  flexShrink: 1,
                  minWidth: 0,
                }}
              >
                {variants && variants.length > 0
                  ? isMobile
                    ? formatPrice(displayPrice)
                    : `From ${formatPrice(displayPrice)}`
                  : formatPrice(price)}
              </Typography>

              {isProduct && (
                <Typography
                  variant="caption"
                  sx={{
                    color: stock < 5 ? "error.main" : "text.secondary",
                    fontWeight: stock < 5 ? 700 : 600,
                    fontSize: isMobile ? "0.68rem" : "0.74rem",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: isMobile ? "42%" : "38%",
                  }}
                >
                  {formatStock(stock)}
                </Typography>
              )}
            </Box>
          </CardContent>
        </CardActionArea>

        {/* Actions Section */}
        {showActions ? (
          // Seller Actions - Compact mobile-friendly design
          <CardActions
            sx={{
              px: isMobile ? 1 : 2,
              pb: isMobile ? 1 : 2,
              pt: isMobile ? 0.75 : 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
              display: "flex",
              gap: isMobile ? 0.5 : 1,
              flexWrap: "nowrap",
              minHeight: isMobile ? 42 : 52,
            }}
          >
            {/* Edit Button - Compact on mobile */}
            <Button
              variant="outlined"
              size="small"
              onClick={handleEdit}
              aria-label={`Edit ${name}`}
              sx={{
                flex: 1,
                textTransform: "none",
                fontWeight: 500,
                fontSize: isMobile ? "0.7rem" : "0.875rem",
                py: isMobile ? 0.5 : 0.75,
                px: isMobile ? 0.75 : 1.5,
                minWidth: isMobile ? 0 : "auto",
                borderColor: "primary.main",
                color: "primary.main",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              Edit
            </Button>

            {/* Toggle Availability Button - Compact icon */}
            <Tooltip
              title={isAvailable ? "Hide listing" : "Show listing"}
              placement="top"
            >
              <IconButton
                size="small"
                onClick={handleToggle}
                aria-label={
                  isAvailable
                    ? `Hide ${name} from buyers`
                    : `Show ${name} to buyers`
                }
                sx={{
                  color: isAvailable ? "warning.main" : "success.main",
                  border: "1px solid",
                  borderColor: isAvailable ? "warning.main" : "success.main",
                  borderRadius: 1,
                  p: isMobile ? 0.4 : 0.5,
                  minWidth: isMobile ? 28 : 32,
                  width: isMobile ? 28 : 32,
                  height: isMobile ? 28 : 32,
                  "&:hover": {
                    backgroundColor: isAvailable
                      ? "warning.main"
                      : "success.main",
                    color: "white",
                  },
                  "& .MuiSvgIcon-root": {
                    fontSize: isMobile ? "0.9rem" : "1.25rem",
                  },
                }}
              >
                {isAvailable ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Tooltip>

            {/* Delete Button - Compact icon */}
            <Tooltip title="Delete listing" placement="top">
              <IconButton
                size="small"
                onClick={handleDelete}
                aria-label={`Delete ${name}`}
                sx={{
                  color: "error.main",
                  border: "1px solid",
                  borderColor: "error.main",
                  borderRadius: 1,
                  p: isMobile ? 0.4 : 0.5,
                  minWidth: isMobile ? 28 : 32,
                  width: isMobile ? 28 : 32,
                  height: isMobile ? 28 : 32,
                  "&:hover": {
                    backgroundColor: "error.main",
                    color: "white",
                  },
                  "& .MuiSvgIcon-root": {
                    fontSize: isMobile ? "0.9rem" : "1.25rem",
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </CardActions>
        ) : (
          // Consumer Actions - Only show for authenticated users
          isAuthenticated && (
            <CardActions
              sx={{
                px: isMobile ? 1.5 : 2,
                pb: isMobile ? 1.5 : 2,
                pt: isMobile ? 1 : 1.5,
                gap: 1,
                borderTop: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
                minHeight: isMobile ? 42 : 52,
              }}
            >
              <Button
                variant="contained"
                size="small"
                startIcon={!isMobile && <ShoppingCartIcon />}
                onClick={handleAddToCartClick}
                disabled={!canAddToCart}
                fullWidth
                aria-label={`Add ${name} to cart`}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.75rem" : undefined,
                  py: isMobile ? 0.75 : undefined,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
              >
                {isMobile ? "Add" : "Add to Cart"}
              </Button>

              {/* Only show wishlist button for authenticated users */}
              <Tooltip
                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <IconButton
                  onClick={handleToggleWishlist}
                  size={isMobile ? "small" : "medium"}
                  aria-label={
                    inWishlist
                      ? `Remove ${name} from wishlist`
                      : `Add ${name} to wishlist`
                  }
                  sx={{
                    color: inWishlist ? "error.main" : "text.secondary",
                    "&:hover": {
                      color: "error.main",
                    },
                  }}
                >
                  {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            </CardActions>
          )
        )}
      </Card>

      {/* Add to Cart Dialog */}
      <AddToCartDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        listing={listing}
        isWishlistContext={isWishlistContext}
      />
    </Box>
  );
};

export default ListingCard;
