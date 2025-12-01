import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  ShoppingCart as CartIcon,
  Store as StoreIcon,
  Inventory as StockIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Bolt as BuyNowIcon,
} from "@mui/icons-material";

import { useTheme } from "../../hooks/useTheme";
import { useSnackbar } from "../../hooks/useSnackbar";
import useListings from "../../features/listing/hooks/useListings";
import useWishlist from "../../features/wishlist/hook/useWishlist";
import { CATEGORY_LABELS } from "../../constants/listingConstant";
import ImageGallery from "../../features/listing/components/ImageGallery";
import { ErrorAlert } from "../../components/common/Alert";
import { BackButton } from "../../components/common/Navigation";
import { ROUTES } from "../../constants/routes";
import AddToCartDialog from "../../features/cart/components/AddToCartDialog";
import { createSessionFromListing } from "../../features/checkout/store/checkoutSlice";

const ListingDetailPage = () => {
  const { theme } = useTheme();
  const { listingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error: showError } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const { currentListing, isLoading, error, getListingById, clearCurrent } =
    useListings();

  // Wishlist hook
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (listingId) {
      getListingById(listingId);
    }
    return () => {
      clearCurrent();
    };
  }, [listingId]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !currentListing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorAlert error={error} show={!!error} fallback="Listing not found" />
        <BackButton sx={{ mt: 2 }} />
      </Container>
    );
  }

  const {
    name,
    description,
    price,
    category,
    type,
    images,
    stock,
    isFree,
    isAvailable,
    seller = {},
  } = currentListing;

  const {
    username = "unknown",
    shopName,
    shopSlug = null,
    isVerifiedMerchant = false,
  } = seller;

  const displayName = shopName || username;

  const inWishlist = isInWishlist(listingId);
  const canAddToCart = isAvailable && (type === "service" || stock > 0);

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      // For services, quantity is 1; for products, default to 1
      const quantity = 1;

      // Create checkout session for direct purchase
      const result = await dispatch(
        createSessionFromListing({ listingId, quantity })
      ).unwrap();

      // Navigate to checkout page
      navigate(ROUTES.CHECKOUT.INDEX);
      success("Redirecting to checkout...");
    } catch (error) {
      showError(error.message || "Failed to start checkout. Please try again.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleAddToCartClick = () => {
    setDialogOpen(true);
  };

  const handleToggleWishlist = async () => {
    try {
      if (inWishlist) {
        await removeFromWishlist(listingId);
        success("Removed from wishlist");
      } else {
        await addToWishlist(listingId);
        success("Added to wishlist!");
      }
    } catch (error) {
      showError(error.message || "Failed to update wishlist");
    }
  };

  const handleViewCart = () => {
    navigate(ROUTES.CART);
  };

  const handleViewShop = () => {
    if (shopSlug) {
      // Navigate to shop profile page
      navigate(`/merchants/${shopSlug}`);
    } else {
      // Fallback to user profile if no shop exists
      navigate(`/user/${username}`);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4 }}
      component="section"
      aria-labelledby="listing-title"
    >
      {/* Professional Back Button */}
      <BackButton sx={{ mb: 3 }} />

      {/* TOP ROW - Images & Main Content Side by Side */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "40% 1fr" },
          gap: 4,
          mb: 4,
        }}
      >
        {/* LEFT COLUMN - Image Gallery */}
        <Box
          component="aside"
          aria-label="Product images"
          sx={{
            order: { xs: 1, md: 1 },
          }}
        >
          <ImageGallery images={images} altText={name} />
        </Box>

        {/* RIGHT COLUMN - All Product Details */}
        <Box
          component="article"
          aria-labelledby="listing-title"
          sx={{
            order: { xs: 2, md: 2 },
          }}
        >
          {/* Listing Name */}
          <Typography
            variant="h4"
            component="h1"
            fontWeight="700"
            sx={{ mb: 3 }}
            id="listing-title"
          >
            {name}
          </Typography>
          {/* Description Section */}
          <Box
            component="section"
            aria-labelledby="description-heading"
            sx={{ mb: 4 }}
          >
            <Typography
              variant="h5"
              component="h2"
              fontWeight="700"
              gutterBottom
              id="description-heading"
            >
              Description
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
              }}
            >
              {description}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Price Section */}
          <Box
            component="section"
            aria-labelledby="price-heading"
            sx={{ mb: 3 }}
          >
            <Typography
              variant="h6"
              component="h2"
              fontWeight="700"
              color="text.secondary"
              gutterBottom
              id="price-heading"
            >
              Price
            </Typography>
            {isFree ? (
              <Typography variant="h3" fontWeight="700" color="success.main">
                FREE
              </Typography>
            ) : (
              <Typography variant="h3" fontWeight="700" color="primary.main">
                RM {parseFloat(price).toFixed(2)}
              </Typography>
            )}
          </Box>

          {/* Stock Section (Products Only) */}
          {type === "product" && (
            <Box
              component="section"
              aria-labelledby="stock-heading"
              sx={{ mb: 3 }}
            >
              <Typography
                variant="h6"
                component="h2"
                fontWeight="700"
                color="text.secondary"
                gutterBottom
                id="stock-heading"
              >
                Stock Availability
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <StockIcon color={stock > 0 ? "success" : "error"} />
                <Typography
                  variant="h5"
                  fontWeight="700"
                  color={stock > 0 ? "success.main" : "error.main"}
                  aria-live="polite"
                >
                  {stock > 0 ? `${stock} units in stock` : "Out of Stock"}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Category & Tags Section */}
          <Box
            component="section"
            aria-labelledby="category-heading"
            sx={{ mb: 4 }}
          >
            <Typography
              variant="h6"
              component="h2"
              fontWeight="700"
              color="text.secondary"
              gutterBottom
              id="category-heading"
            >
              Category & Type
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip
                label={CATEGORY_LABELS[category] || category}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={type === "product" ? "Product" : "Service"}
                color="secondary"
                variant="outlined"
              />
              {isAvailable ? (
                <Chip label="Available" color="success" size="small" />
              ) : (
                <Chip label="Unavailable" color="error" size="small" />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Stock Warning */}
          {type === "product" && stock > 0 && stock <= 5 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Only {stock} left in stock! Order soon.
            </Alert>
          )}

          {/* Action Section */}
          <Box component="section" aria-label="Purchase actions" sx={{ mb: 4 }}>
            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Buy Now Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={!isBuyingNow && <BuyNowIcon />}
                onClick={handleBuyNow}
                disabled={!canAddToCart || isBuyingNow}
                color="secondary"
                sx={{
                  flex: 1,
                  minWidth: "200px",
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                {isBuyingNow ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : !isAvailable ? (
                  "Unavailable"
                ) : type === "product" && stock <= 0 ? (
                  "Out of Stock"
                ) : (
                  "Buy Now"
                )}
              </Button>

              {/* Add to Cart Button */}
              <Button
                variant="outlined"
                size="large"
                startIcon={<CartIcon />}
                onClick={handleAddToCartClick}
                disabled={!canAddToCart}
                sx={{
                  flex: 1,
                  minWidth: "200px",
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                {!isAvailable
                  ? "Unavailable"
                  : type === "product" && stock <= 0
                    ? "Out of Stock"
                    : "Add to Cart"}
              </Button>

              {/* Wishlist Toggle Button */}
              <Tooltip
                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <IconButton
                  onClick={handleToggleWishlist}
                  size="large"
                  sx={{
                    border: "2px solid",
                    borderColor: inWishlist ? "error.main" : "divider",
                    color: inWishlist ? "error.main" : "text.secondary",
                    "&:hover": {
                      borderColor: "error.main",
                      color: "error.main",
                      backgroundColor: "action.hover",
                    },
                  }}
                  aria-label={
                    inWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* BOTTOM ROW - Seller Information (Full Width) */}
      <Card
        variant="outlined"
        component="aside"
        aria-label="Seller information"
        sx={{ mt: 4 }}
      >
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            fontWeight="700"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Seller Information
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 64,
                height: 64,
              }}
              aria-label={`${displayName}'s avatar`}
            >
              <StoreIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 0.5 }}>
                {displayName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                @{username}
              </Typography>
              {isVerifiedMerchant && (
                <Chip label="Verified" color="success" size="small" />
              )}
            </Box>
            <Button
              variant="outlined"
              size="large"
              onClick={handleViewShop}
              aria-label={`Visit ${shopSlug ? displayName + "'s shop" : displayName + "'s profile"}`}
              sx={{ mt: 1, minWidth: 200 }}
            >
              Visit {shopSlug ? "Shop" : "Profile"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Add to Cart Dialog */}
      <AddToCartDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        listing={currentListing}
      />
    </Container>
  );
};

export default ListingDetailPage;
