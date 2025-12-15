import { useState } from "react";
import {
  Box,
  Typography,
  Card,
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
  ImageNotSupported as NoImageIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../../hooks/useTheme";
import { useSnackbarContext as useSnackbar } from "../../../contexts/SnackbarContext";
import { useAuth } from "../../auth/hooks/useAuth";
import { CATEGORY_LABELS } from "../../../constants/listingConstant";
import { ROUTES } from "../../../constants/routes";
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

  const { isInCart, getCartItem, addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, moveToCart } =
    useWishlist();

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

  const handleViewCart = (event) => {
    event.stopPropagation();
    navigate(ROUTES.CART);
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
  const cartItem = getCartItem(_id);

  return (
    <>
      <Card
        sx={{
          width: "100%",
          maxWidth: isMobile ? "100%" : 280,
          height: isMobile ? 350 : 440,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
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
        onClick={handleCardClick}
        key={_id}
      >
        {/* Image Section - Fixed Height */}
        <Box
          sx={{
            position: "relative",
            height: isMobile ? 160 : 210,
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
              height={isMobile ? "160" : "210"}
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
              top: 8,
              left: 8,
              display: "flex",
              gap: 0.5,
              flexWrap: "wrap",
              maxWidth: { xs: "60%", sm: "calc(100% - 100px)" }, // Leave space for type badge
            }}
          >
            {!isAvailable && (
              <Chip
                label="Unavailable"
                size="small"
                sx={{
                  backgroundColor: "rgba(211, 47, 47, 0.9)",
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
                  backgroundColor: "rgba(237, 108, 2, 0.9)",
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
                  backgroundColor: "rgba(46, 125, 50, 0.9)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                }}
              />
            )}
          </Box>

          {/* Type Badge - Right Side */}
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
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

        {/* Content Section - Flex Grow */}
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            pb: 1,
            pt: isMobile ? 1.5 : 2,
            px: isMobile ? 1.5 : 2,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* Title - 2 lines max with ellipsis */}
          <Typography
            variant={isMobile ? "subtitle2" : "h6"}
            sx={{
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.3,
              height: isMobile ? "2.6em" : "2.6em",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              hyphens: "auto",
              fontSize: isMobile ? "0.8rem" : "0.95rem",
              mb: isMobile ? 0.5 : 0.75,
            }}
            title={name}
          >
            {name}
          </Typography>

          {/* Description - 2 lines max with ellipsis */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.4,
              height: "2.8em",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              fontSize: isMobile ? "0.7rem" : "0.8rem",
              mb: isMobile ? 0.5 : 0.75,
            }}
            title={description || "No description"}
          >
            {description || "\u00A0"}
          </Typography>

          {/* Category - Single line with ellipsis */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: isMobile ? "0.65rem" : "0.75rem",
              mb: isMobile ? 0.5 : 0.75,
              display: "block",
              maxWidth: "100%",
            }}
            title={CATEGORY_LABELS[category] || category}
          >
            {CATEGORY_LABELS[category] || category}
          </Typography>

          {/* Price */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
              mt: "auto",
              pt: 1,
              gap: 1,
              minWidth: 0, // Allow flex items to shrink
            }}
          >
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: isMobile ? "0.8rem" : "0.9rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: isMobile ? "55%" : "60%",
                flexShrink: 1,
                minWidth: 0,
              }}
            >
              {formatPrice(price)}
            </Typography>

            {/* Stock Info - Only for products */}
            {isProduct && (
              <Typography
                variant="caption"
                sx={{
                  color: stock < 5 ? "error.main" : "text.secondary",
                  fontWeight: stock < 5 ? 700 : 600,
                  fontSize: isMobile ? "0.65rem" : "0.7rem",
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
            }}
          >
            {/* Edit Button - Compact on mobile */}
            <Button
              variant="outlined"
              size="small"
              onClick={handleEdit}
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
              }}
            >
              <Button
                variant="contained"
                size="small"
                startIcon={!isMobile && <ShoppingCartIcon />}
                onClick={handleAddToCartClick}
                disabled={!canAddToCart}
                fullWidth
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
    </>
  );
};

export default ListingCard;
