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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../../hooks/useTheme";
import { useSnackbarContext as useSnackbar } from "../../../contexts/SnackbarContext";
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

  const imageUrl =
    images && images.length > 0
      ? typeof images[0] === "string"
        ? images[0]
        : images[0]?.url || "https://via.placeholder.com/320x180?text=No+Image"
      : "https://via.placeholder.com/320x180?text=No+Image";

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
          }}
        >
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

          {/* Badges Overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              display: "flex",
              gap: 0.5,
              flexWrap: "wrap",
              maxWidth: "calc(100% - 16px)",
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
                }}
              />
            )}
          </Box>

          {/* Type Badge */}
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
          {/* Title - 2 lines max */}
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
              fontSize: isMobile ? "0.875rem" : undefined,
              mb: 0.5,
            }}
          >
            {name}
          </Typography>

          {/* Description - Hidden on mobile, 2 lines max on desktop */}
          {!isMobile && (
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
                mb: 0.5,
              }}
            >
              {description || "\u00A0"}
            </Typography>
          )}

          {/* Category */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: isMobile ? "0.7rem" : undefined,
              mb: 0.5,
            }}
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
            }}
          >
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: isMobile ? "0.95rem" : undefined,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: isMobile ? "60%" : "70%",
              }}
            >
              {isFree
                ? "FREE"
                : price >= 99999.99
                  ? "RM99999+"
                  : `RM${price.toFixed(2)}`}
            </Typography>

            {/* Stock Info - Only for products */}
            {isProduct && (
              <Typography
                variant="caption"
                sx={{
                  color: stock < 5 ? "error.main" : "text.secondary",
                  fontWeight: stock < 5 ? 700 : 600,
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                  flexShrink: 0,
                }}
              >
                {stock > 0
                  ? stock >= 1000000
                    ? `${(stock / 1000000).toFixed(1)}m left`
                    : stock >= 1000
                      ? `${(stock / 1000).toFixed(1)}k left`
                      : `${stock} left`
                  : "Out of stock"}
              </Typography>
            )}
          </Box>
        </CardContent>

        {/* Actions Section */}
        {showActions ? (
          // Seller Actions
          <CardActions
            sx={{
              justifyContent: "space-between",
              px: isMobile ? 1.5 : 2,
              pb: isMobile ? 1.5 : 2,
              pt: isMobile ? 1 : 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <Box>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={handleEdit} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={handleDelete} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Tooltip title={isAvailable ? "Hide" : "Show"}>
              <IconButton size="small" onClick={handleToggle}>
                {isAvailable ? (
                  <VisibilityIcon fontSize="small" />
                ) : (
                  <VisibilityOffIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </CardActions>
        ) : (
          // Consumer Actions
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
                fontSize: isMobile ? "0.8rem" : undefined,
                py: isMobile ? 0.75 : undefined,
              }}
            >
              {isMobile ? "Add" : "Add to Cart"}
            </Button>

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
