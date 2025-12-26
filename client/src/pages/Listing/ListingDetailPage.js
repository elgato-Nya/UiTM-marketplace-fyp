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
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  Store as StoreIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";

import { useTheme } from "../../hooks/useTheme";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useAuth } from "../../features/auth/hooks/useAuth";
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
  const { isAuthenticated } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const { currentListing, isLoading, error, getListingById, clearCurrent } =
    useListings();

  // Wishlist hook
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Scroll to top when component mounts or listingId changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [listingId]);

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

  // Extract seller information - handle both populated and unpopulated cases
  const sellerUser = seller.userId || seller; // userId exists if populated
  const {
    username = seller.username || "unknown",
    merchantDetails = {},
    isVerifiedMerchant = seller.isVerifiedMerchant || false,
  } = sellerUser;

  const {
    shopName = seller.shopName || null,
    shopSlug = seller.shopSlug || null,
    shopLogo = null,
  } = merchantDetails;

  const displayName = shopName || username;

  const inWishlist = isInWishlist(listingId);
  const canAddToCart = isAvailable && (type === "service" || stock > 0);

  // Format price with spaces (e.g., 1 234 567.89)
  const formatPrice = (price) => {
    if (isFree) return "FREE";
    if (price >= 100000) {
      // Use prefix for 100k+
      if (price >= 1000000000) {
        return `RM ${(price / 1000000000).toFixed(1)}b`;
      }
      if (price >= 1000000) {
        return `RM ${(price / 1000000).toFixed(1)}m`;
      }
      return `RM ${(price / 1000).toFixed(1)}k`;
    }
    // Format with spaces for numbers < 100k
    const parts = price.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `RM ${parts.join(".")}`;
  };

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
      maxWidth="lg"
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Back Button */}
      <BackButton sx={{ mb: 2 }} />

      {/* Main Content Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 2, md: 4 },
          mb: 3,
        }}
      >
        {/* Image Gallery */}
        <Box sx={{ width: "100%" }}>
          <ImageGallery images={images} altText={name} />
        </Box>

        {/* Product Information */}
        <Box sx={{ width: "100%" }}>
          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            fontWeight="700"
            sx={{
              mb: 1.5,
              fontSize: { xs: "1.5rem", md: "2rem" },
              lineHeight: 1.3,
            }}
          >
            {name}
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              fontSize: { xs: "0.875rem", md: "1rem" },
            }}
          >
            {description}
          </Typography>

          {/* Price */}
          {isFree ? (
            <Typography
              variant="h3"
              fontWeight="700"
              color="success.main"
              sx={{
                mb: 2,
                fontSize: { xs: "1.75rem", md: "2.25rem" },
              }}
            >
              FREE
            </Typography>
          ) : (
            <Typography
              variant="h3"
              fontWeight="700"
              color="primary.main"
              sx={{
                mb: 2,
                fontSize: { xs: "1.75rem", md: "2.25rem" },
              }}
            >
              {formatPrice(price)}
            </Typography>
          )}

          {/* Stock Status for Products */}
          {type === "product" && (
            <Box sx={{ mb: 2, mt: 2 }}>
              <Typography
                variant="body2"
                fontWeight="500"
                color={
                  stock > 0 && stock <= 5 ? "error.main" : "text.secondary"
                }
                sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}
              >
                {stock > 0 ? `${stock} in stock` : "Out of stock"}
              </Typography>
            </Box>
          )}

          {/* Category & Type */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.8125rem", md: "0.875rem" } }}
            >
              {CATEGORY_LABELS[category] || category} •{" "}
              {type === "product" ? "Product" : "Service"}
            </Typography>
          </Box>

          {/* Action Buttons */}
          {isAuthenticated ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 1.5,
                mt: 3,
                mb: 0,
              }}
            >
              {/* Buy Now */}
              <Button
                variant="contained"
                size="large"
                onClick={handleBuyNow}
                disabled={!canAddToCart || isBuyingNow}
                sx={{
                  py: 1.5,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: 600,
                  textTransform: "none",
                  flex: 1,
                }}
              >
                {isBuyingNow ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : !canAddToCart ? (
                  "Unavailable"
                ) : (
                  "Buy Now"
                )}
              </Button>

              {/* Add to Cart */}
              <Button
                variant="outlined"
                size="large"
                onClick={handleAddToCartClick}
                disabled={!canAddToCart}
                sx={{
                  py: 1.5,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: 600,
                  textTransform: "none",
                  flex: 1,
                }}
              >
                Add to Cart
              </Button>

              {/* Wishlist - Icon Only */}
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
                    },
                  }}
                >
                  {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Alert
              severity="info"
              sx={{ mb: 0, fontSize: { xs: "0.8125rem", md: "0.875rem" } }}
            >
              Please log in to purchase this item.
            </Alert>
          )}
        </Box>
      </Box>

      {/* Seller Information Card */}
      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            fontWeight="600"
            gutterBottom
            sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
          >
            Seller Information
          </Typography>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "center", sm: "flex-start" }}
            gap={2}
          >
            <Avatar
              src={shopLogo}
              alt={displayName}
              sx={{
                bgcolor: theme.palette.primary.main,
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
              }}
            >
              {!shopLogo && <StoreIcon sx={{ fontSize: { xs: 32, sm: 36 } }} />}
            </Avatar>
            <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ fontSize: { xs: "1rem", md: "1.125rem" } }}
              >
                {displayName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontSize: { xs: "0.8125rem", md: "0.875rem" } }}
              >
                @{username}
              </Typography>
              {isVerifiedMerchant && (
                <Chip label="Verified Merchant" color="success" size="small" />
              )}
            </Box>
            <Button
              variant="outlined"
              onClick={handleViewShop}
              sx={{
                minWidth: { xs: "100%", sm: 150 },
                textTransform: "none",
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
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
