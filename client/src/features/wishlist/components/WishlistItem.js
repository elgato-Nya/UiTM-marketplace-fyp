import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import PriceChangeIndicator from "../../cart/components/PriceChangeIndicator";
import { useTheme } from "../../../hooks/useTheme";

const WishlistItem = ({ item, onRemove, onMoveToCart, isLoading = false }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState(null);

  const listing = item.listing;
  const removeTargetId = listing?._id || item._id;
  const currentPrice = listing?.price;
  const priceWhenAdded = item.priceWhenAdded;
  const isDeleted = !listing || listing.isDeleted === true;
  const isAvailable = !isDeleted && listing.isAvailable;
  const hasStock = !isDeleted && listing.stock > 0;

  const handleRemove = async () => {
    setLoadingAction("remove");
    try {
      await onRemove(removeTargetId);
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMoveToCart = async () => {
    setLoadingAction("cart");
    try {
      if (!listing?._id) return;
      await onMoveToCart(listing._id);
    } catch (error) {
      console.error("Move to cart error:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const goToListing = () => {
    if (!listing?._id || isDeleted) return;
    navigate(`/listings/${listing._id}`);
  };

  const canAddToCart = !isDeleted && isAvailable && hasStock;

  if (!listing) {
    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: "1px solid",
          borderColor: "error.main",
          bgcolor: "error.lighter",
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Chip label="Removed" color="error" size="small" sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Listing no longer available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This listing was removed by the seller. You can remove it from your
            wishlist below.
          </Typography>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button variant="contained" disabled fullWidth sx={{ mr: 1 }}>
            Unavailable
          </Button>
          <Tooltip title="Remove from wishlist">
            <IconButton
              size="small"
              color="error"
              onClick={handleRemove}
              disabled={isLoading || loadingAction === "remove"}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  }

  return (
    <Card
      x={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        opacity: !canAddToCart ? 0.7 : 1,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {/** Status Badges */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {isDeleted && <Chip label="Removed" color="error" size="small" />}
        {!isDeleted && !isAvailable && (
          <Chip label="Unavailable" color="error" size="small" />
        )}
        {isAvailable && !hasStock && (
          <Chip label="Out of Stock" color="warning" size="small" />
        )}
      </Box>

      {/** Image */}
      <CardMedia
        component="img"
        sx={{
          height: 200,
          objectFit: "cover",
          cursor: "pointer",
        }}
        image={listing.images?.[0] || "/placeholder-image.png"}
        alt={listing.name}
        onClick={goToListing}
      />

      {/** Content */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/** Listing Name */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            cursor: "pointer",
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            "&:hover": { color: theme.palette.primary.main },
          }}
          onClick={goToListing}
        >
          {listing.name}
        </Typography>

        {/* Current Price */}
        <Typography
          variant="h6"
          color="primary"
          sx={{ fontWeight: 600, mb: 1 }}
        >
          RM{currentPrice.toFixed(2)}
        </Typography>

        {/* Price Change Indicator */}
        {priceWhenAdded !== currentPrice && (
          <Box sx={{ mb: 1 }}>
            <PriceChangeIndicator
              originalPrice={priceWhenAdded}
              currentPrice={currentPrice}
              showLabel={false}
              size="small"
            />
          </Box>
        )}

        {/* Added Date */}
        <Typography variant="caption" color="text.secondary">
          Added {new Date(item.addedAt).toLocaleDateString()}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          justifyContent: "space-between",
          px: 2,
          pb: 2,
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<ShoppingCartIcon />}
          onClick={handleMoveToCart}
          disabled={!canAddToCart || isLoading || loadingAction === "cart"}
          fullWidth
          sx={{ mr: 1 }}
        >
          {isDeleted
            ? "Removed"
            : !isAvailable
            ? "Unavailable"
            : !hasStock
              ? "Out of Stock"
              : "Add to Cart"}
        </Button>

        <Tooltip title="Remove from wishlist">
          <IconButton
            size="small"
            color="error"
            onClick={handleRemove}
            disabled={isLoading || loadingAction === "remove"}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default WishlistItem;
