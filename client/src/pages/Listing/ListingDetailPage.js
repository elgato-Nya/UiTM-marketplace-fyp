import { useEffect, useState, useMemo, useCallback } from "react";
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
  RequestQuote as QuoteIcon,
} from "@mui/icons-material";

import { useTheme } from "../../hooks/useTheme";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useAuth } from "../../features/auth/hooks/useAuth";
import useListings from "../../features/listing/hooks/useListings";
import useWishlist from "../../features/wishlist/hook/useWishlist";
import { CATEGORY_LABELS } from "../../constants/listingConstant";
import ImageGallery from "../../features/listing/components/ImageGallery";
import VariantAttributeSelector from "../../features/listing/components/variants/VariantAttributeSelector";
import QuoteRequestForm from "../../features/listing/components/QuoteRequestForm";
import ErrorAlert from "../../components/common/Alert/ErrorAlert";
import BackButton from "../../components/common/Navigation/BackButton";
import { ROUTES } from "../../constants/routes";
import AddToCartDialog from "../../features/cart/components/AddToCartDialog";
import BuyNowDialog from "../../features/cart/components/BuyNowDialog";
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
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [buyNowDialogOpen, setBuyNowDialogOpen] = useState(false);

  const { currentListing, isLoading, error, getListingById, clearCurrent } =
    useListings();

  // Wishlist hook
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Handle quote request - defined early to avoid conditional hook issues
  const handleRequestQuote = useCallback(() => {
    if (!isAuthenticated) {
      showError("Please log in to request a quote");
      navigate(ROUTES.AUTH.LOGIN, {
        state: { from: window.location.pathname },
      });
      return;
    }
    setQuoteDialogOpen(true);
  }, [isAuthenticated, showError, navigate]);

  // Handle quote submission
  const handleQuoteSubmit = useCallback(
    async (quoteData) => {
      setQuoteLoading(true);
      try {
        // TODO: Implement quote submission API call
        // For now, just show success message
        console.log("Quote request submitted:", quoteData);
        success(
          "Quote request submitted successfully! The seller will respond soon."
        );
        setQuoteDialogOpen(false);
      } catch (error) {
        showError(error.message || "Failed to submit quote request");
      } finally {
        setQuoteLoading(false);
      }
    },
    [success, showError]
  );

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

  // Extract data early to avoid conditional hooks
  const listing = currentListing || {};
  const {
    name = "",
    description = "",
    price = 0,
    category = "",
    type = "",
    images = [],
    stock = 0,
    isFree = false,
    isAvailable = false,
    seller = {},
    variants = [],
  } = listing;

  // Check if listing has variants
  const hasVariants = variants && variants.length > 0;

  // Get available variants only - always call useMemo
  const availableVariants = useMemo(() => {
    return hasVariants ? variants.filter((v) => v.isAvailable !== false) : [];
  }, [hasVariants, variants]);

  // Calculate price range for variants - always call useMemo
  const priceRange = useMemo(() => {
    if (!hasVariants || availableVariants.length === 0) {
      return null;
    }

    const prices = availableVariants
      .map((v) => Number(v.price) || 0)
      .filter((p) => p > 0);
    if (prices.length === 0) return null;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return minPrice === maxPrice ? null : { min: minPrice, max: maxPrice };
  }, [hasVariants, availableVariants]);

  // Determine effective price and stock based on variant selection
  const effectivePrice = selectedVariant ? selectedVariant.price : price;
  const effectiveStock = selectedVariant
    ? selectedVariant.stock
    : hasVariants
      ? availableVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : stock;

  // Early returns after all hooks
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

  // For listings with variants, we now allow opening the dialog without pre-selection
  // The variant selection happens inside the modal
  const canAddToCart = hasVariants
    ? availableVariants.length > 0 // Can open dialog if there are available variants
    : isAvailable && (type === "service" || stock > 0);

  // For Buy Now, if listing has variants, we need to open a modal for selection
  // For now, we'll disable direct Buy Now and require going through Add to Cart first
  const canBuyNow = hasVariants
    ? selectedVariant &&
      selectedVariant.isAvailable !== false &&
      (type === "service" || selectedVariant.stock > 0)
    : isAvailable && (type === "service" || stock > 0);

  // Check if listing supports quote requests
  const hasQuoteSettings =
    type === "service" && currentListing?.quoteSettings?.enabled;

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
    // If listing has variants, open modal for selection
    if (hasVariants && !selectedVariant) {
      setBuyNowDialogOpen(true);
      return;
    }

    setIsBuyingNow(true);
    try {
      // For services, quantity is 1; for products, default to 1
      const quantity = 1;

      // Create checkout session for direct purchase
      const sessionData = { listingId, quantity };
      if (selectedVariant) {
        sessionData.variantId = selectedVariant._id;
      }

      const result = await dispatch(
        createSessionFromListing(sessionData)
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
              {priceRange && !selectedVariant
                ? `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`
                : formatPrice(effectivePrice)}
              {hasVariants && !selectedVariant && !priceRange && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1, fontWeight: 400 }}
                >
                  (select variant)
                </Typography>
              )}
            </Typography>
          )}

          {/* Variant Selector */}
          {hasVariants && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1.5, fontWeight: 600 }}
              >
                Select Variant ({availableVariants.length} available)
              </Typography>
              <VariantAttributeSelector
                variants={variants}
                selectedVariant={selectedVariant}
                onVariantSelect={(variant) => setSelectedVariant(variant)}
              />
            </Box>
          )}

          {/* Stock Status for Products */}
          {type === "product" && !hasVariants && (
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
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 1.5,
                  mt: 3,
                  mb: 0,
                }}
              >
                {/* Buy Now - For variants, opens modal if no variant selected */}
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
                  ) : hasVariants && !selectedVariant ? (
                    "Buy Now"
                  ) : (
                    "Buy Now"
                  )}
                </Button>

                {/* Add to Cart - For variants, opens modal for selection */}
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
                  title={
                    inWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
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

              {/* Quote Request Button - For services with quote settings */}
              {hasQuoteSettings && (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={handleRequestQuote}
                  startIcon={<QuoteIcon />}
                  sx={{
                    py: 1.5,
                    mt: 2,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    fontWeight: 600,
                    textTransform: "none",
                    width: "100%",
                  }}
                >
                  Request a Quote
                </Button>
              )}
            </>
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
            sx={{ mb: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}
          >
            Seller Information
          </Typography>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="flex-start"
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
                minWidth: 150,
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
        selectedVariant={hasVariants ? selectedVariant : null}
      />

      {/* Buy Now Dialog - for variant selection before checkout */}
      {hasVariants && (
        <BuyNowDialog
          open={buyNowDialogOpen}
          onClose={() => setBuyNowDialogOpen(false)}
          listing={currentListing}
          selectedVariant={selectedVariant}
          onBuyNow={async (variant) => {
            setBuyNowDialogOpen(false);
            setSelectedVariant(variant);
            setIsBuyingNow(true);
            try {
              const sessionData = {
                listingId,
                quantity: 1,
                variantId: variant._id,
              };
              await dispatch(createSessionFromListing(sessionData)).unwrap();
              navigate(ROUTES.CHECKOUT.INDEX);
              success("Redirecting to checkout...");
            } catch (error) {
              showError(
                error.message || "Failed to start checkout. Please try again."
              );
            } finally {
              setIsBuyingNow(false);
            }
          }}
        />
      )}

      {/* Quote Request Dialog */}
      {hasQuoteSettings && (
        <QuoteRequestForm
          open={quoteDialogOpen}
          onClose={() => setQuoteDialogOpen(false)}
          listing={currentListing}
          onSubmit={handleQuoteSubmit}
          isLoading={quoteLoading}
        />
      )}
    </Container>
  );
};

export default ListingDetailPage;
