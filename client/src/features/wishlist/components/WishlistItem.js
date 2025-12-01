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
  const currentPrice = listing?.price;
  const priceWhenAdded = item.priceWhenAdded;
  const isAvailable = listing.isAvailable;
  const hasStock = listing.stock > 0;

  const handleRemove = async () => {
    setLoadingAction("remove");
    try {
      await onRemove(listing._id);
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMoveToCart = async () => {
    setLoadingAction("cart");
    try {
      await onMoveToCart(listing._id);
    } catch (error) {
      console.error("Move to cart error:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const goToListing = () => {
    navigate(`/listings/${listing._id}`);
  };

  const canAddToCart = isAvailable && hasStock;

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
        {!isAvailable && (
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
          {!isAvailable
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
