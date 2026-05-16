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
  Chat as ChatIcon,
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
import { createQuoteRequest } from "../../features/quote/store/quoteSlice";
import { useChatActions } from "../../features/chat/hooks/useChatActions";

const ListingDetailPage = () => {
  const { theme } = useTheme();
  const { listingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error: showError } = useSnackbar();
  const { isAuthenticated, user } = useAuth();
  const { startConversation: initiateChat, actionLoading: chatLoading } =
    useChatActions();
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
        await dispatch(createQuoteRequest(quoteData)).unwrap();
        success(
          "Quote request submitted successfully! The seller will respond soon.",
        );
        setQuoteDialogOpen(false);
      } catch (error) {
        showError(error.message || "Failed to submit quote request");
      } finally {
        setQuoteLoading(false);
      }
    },
    [dispatch, success, showError],
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

  // Determine effective price based on variant selection
  const effectivePrice = selectedVariant ? selectedVariant.price : price;

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

  // Check if listing is quote-only (no fixed price, requires quote request)
  const isQuoteOnly = currentListing?.quoteSettings?.quoteOnly === true;

  // Check if listing supports quote requests
  const hasQuoteSettings =
    type === "service" && currentListing?.quoteSettings?.enabled;

  // For listings with variants, we now allow opening the dialog without pre-selection
  // The variant selection happens inside the modal
  // Quote-only listings cannot be added to cart
  const canAddToCart = isQuoteOnly
    ? false
    : hasVariants
      ? availableVariants.length > 0 // Can open dialog if there are available variants
      : isAvailable && (type === "service" || stock > 0);

  // Buy Now opens dialog flow for both variant and non-variant listings
  // Quote-only listings cannot use Buy Now
  const canBuyNow = isQuoteOnly
    ? false
    : hasVariants
      ? availableVariants.length > 0
      : isAvailable && (type === "service" || stock > 0);

  const listingTypeLabel = type === "product" ? "Product" : "Service";
  const mobileVariantGuidance = hasVariants
    ? "Options available. Select when buying or adding to cart."
    : null;

  // Get price display text for quote-based listings
  const getQuotePriceDisplay = () => {
    const quoteSettings = currentListing?.quoteSettings;
    if (!quoteSettings) return null;

    const minPrice = quoteSettings.minPrice;
    const maxPrice = quoteSettings.maxPrice;

    if (minPrice && maxPrice && minPrice !== maxPrice) {
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    } else if (minPrice) {
      return `From ${formatPrice(minPrice)}`;
    }
    return null;
  };

  // Get variant price display (range or single)
  const getVariantPriceDisplay = () => {
    if (!hasVariants || availableVariants.length === 0) return null;

    const prices = availableVariants
      .map((v) => Number(v.price) || 0)
      .filter((p) => p > 0);
    if (prices.length === 0) return null;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  };

  // Format price with spaces (e.g., 1 234 567.89)
  const formatPrice = (priceValue) => {
    if (isFree) return "FREE";
    if (priceValue >= 100000) {
      // Use prefix for 100k+
      if (priceValue >= 1000000000) {
        return `RM ${(priceValue / 1000000000).toFixed(1)}b`;
      }
      if (priceValue >= 1000000) {
        return `RM ${(priceValue / 1000000).toFixed(1)}m`;
      }
      return `RM ${(priceValue / 1000).toFixed(1)}k`;
    }
    // Format with spaces for numbers < 100k
    const parts = priceValue.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `RM ${parts.join(".")}`;
  };

  const handleBuyNow = () => {
    if (!canBuyNow) return;
    setBuyNowDialogOpen(true);
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

  const handleViewShop = () => {
    if (shopSlug) {
      // Navigate to shop profile page
      navigate(`/merchants/${shopSlug}`);
    }
  };

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      showError("Please log in to message the seller");
      navigate(ROUTES.AUTH.LOGIN, {
        state: { from: window.location.pathname },
      });
      return;
    }

    const sellerId = seller?.userId?._id || seller?.userId || seller?._id;
    if (!sellerId) {
      showError("Unable to identify the seller");
      return;
    }

    const result = await initiateChat({
      recipientId: sellerId.toString(),
      listingId,
    });

    if (result) {
      const convoId = result.conversation?._id || result._id;
      navigate(ROUTES.CHAT.DETAIL(convoId));
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 1.5, sm: 3, md: 4 },
        overflowX: "clip",
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
          width: "100%",
          minWidth: 0,
        }}
      >
        {/* Image Gallery */}
        <Box sx={{ width: "100%", minWidth: 0 }}>
          <ImageGallery images={images} altText={name} />
        </Box>

        {/* Product Information */}
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, md: 2.5 },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="700"
            sx={{
              lineHeight: 1.3,
              overflowWrap: "anywhere",
            }}
          >
            {name}
          </Typography>

          {isFree ? (
            <Typography
              variant="h3"
              fontWeight="700"
              color="success.main"
            >
              FREE
            </Typography>
          ) : isQuoteOnly ? (
            <Typography
              variant="h3"
              fontWeight="700"
              color="primary.main"
            >
              {getQuotePriceDisplay() || "Quote Required"}
            </Typography>
          ) : hasVariants && !selectedVariant ? (
            <Typography
              variant="h3"
              fontWeight="700"
              color="primary.main"
            >
              {getVariantPriceDisplay() || formatPrice(effectivePrice)}
            </Typography>
          ) : (
            <Typography
              variant="h3"
              fontWeight="700"
              color="primary.main"
            >
              {formatPrice(effectivePrice)}
            </Typography>
          )}

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              minWidth: 0,
            }}
          >
            {description}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflowWrap: "anywhere",
            }}
          >
            {CATEGORY_LABELS[category] || category} - {listingTypeLabel}
          </Typography>

          {hasVariants && (
            <>
              <Box sx={{ display: { xs: "none", sm: "block" }, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1.5, fontWeight: 600, overflowWrap: "anywhere" }}
                >
                  Select Variant ({availableVariants.length} available)
                </Typography>
                <VariantAttributeSelector
                  variants={variants}
                  selectedVariant={selectedVariant}
                  onVariantSelect={(variant) => setSelectedVariant(variant)}
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: { xs: "block", sm: "none" },
                  lineHeight: 1.5,
                  overflowWrap: "anywhere",
                  minWidth: 0,
                }}
              >
                {mobileVariantGuidance}
              </Typography>
            </>
          )}

          {isAuthenticated ? (
            <>
              {!isQuoteOnly && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    width: "100%",
                    minWidth: 0,
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleBuyNow}
                    disabled={!canBuyNow || isBuyingNow}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                      width: { xs: "100%", sm: "auto" },
                      flex: { xs: "0 0 auto", sm: 1 },
                      minWidth: 0,
                    }}
                  >
                    {isBuyingNow ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Processing...
                      </>
                    ) : !canBuyNow ? (
                      "Unavailable"
                    ) : (
                      "Buy Now"
                    )}
                  </Button>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 1.5,
                      width: { xs: "100%", sm: "auto" },
                      flex: { xs: "0 0 auto", sm: 1 },
                      minWidth: 0,
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleAddToCartClick}
                      disabled={!canAddToCart}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: "none",
                        flex: 1,
                        width: { xs: "auto", sm: "100%" },
                        minWidth: 0,
                      }}
                    >
                      Add to Cart
                    </Button>

                    <Tooltip
                      title={
                        inWishlist ? "Remove from wishlist" : "Add to wishlist"
                      }
                    >
                      <IconButton
                        onClick={handleToggleWishlist}
                        size="large"
                        aria-label={
                          inWishlist
                            ? `Remove ${name} from wishlist`
                            : `Add ${name} to wishlist`
                        }
                        sx={{
                          border: "2px solid",
                          borderColor: inWishlist ? "error.main" : "divider",
                          color: inWishlist ? "error.main" : "text.secondary",
                          flexShrink: 0,
                          width: 56,
                          height: 56,
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
                </Box>
              )}

              {isQuoteOnly && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    width: "100%",
                  }}
                >
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
                        alignSelf: "stretch",
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
              )}

              {hasQuoteSettings && (
                <Button
                  variant={isQuoteOnly ? "contained" : "outlined"}
                  color={isQuoteOnly ? "primary" : "secondary"}
                  size="large"
                  onClick={handleRequestQuote}
                  startIcon={<QuoteIcon />}
                  sx={{
                    py: 1.5,
                    mt: isQuoteOnly ? 0 : 0.5,
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
              sx={{ mb: 0 }}
            >
              Please log in to{" "}
              {isQuoteOnly ? "request a quote" : "purchase this item"}.
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
            sx={{ mb: 2 }}
          >
            Seller Information
          </Typography>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "flex-start" }}
            gap={2}
          >
            <Avatar
              src={shopLogo}
              alt={displayName}
              sx={{
                bgcolor: theme.palette.primary.main,
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                alignSelf: { xs: "center", sm: "flex-start" },
              }}
            >
              {!shopLogo && <StoreIcon sx={{ fontSize: { xs: 32, sm: 36 } }} />}
            </Avatar>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="600"
              >
                {displayName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                @{username}
              </Typography>
              {isVerifiedMerchant && (
                <Chip label="Verified Merchant" color="success" size="small" />
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {/* Only show Message Seller if it's not the user's own listing */}
              {isAuthenticated &&
                String(user?._id) !==
                  String(
                    seller?.userId?._id || seller?.userId || seller?._id,
                  ) && (
                  <Button
                    variant="contained"
                    startIcon={<ChatIcon />}
                    onClick={handleMessageSeller}
                    disabled={chatLoading === "start"}
                    sx={{
                      minWidth: { xs: 0, sm: 150 },
                      width: { xs: "100%", sm: "auto" },
                      textTransform: "none",
                    }}
                  >
                    {chatLoading === "start" ? "Opening..." : "Message Seller"}
                  </Button>
                )}
              {shopSlug && (
                <Button
                  variant="outlined"
                  onClick={handleViewShop}
                  sx={{
                    minWidth: { xs: 0, sm: 150 },
                    width: { xs: "100%", sm: "auto" },
                    textTransform: "none",
                  }}
                >
                  Visit Shop
                </Button>
              )}
            </Box>
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

      {/* Buy Now Dialog - confirmation flow before checkout */}
      <BuyNowDialog
        open={buyNowDialogOpen}
        onClose={() => setBuyNowDialogOpen(false)}
        listing={currentListing}
        selectedVariant={hasVariants ? selectedVariant : null}
        onBuyNow={async (variant, quantity = 1) => {
          setBuyNowDialogOpen(false);
          if (variant) {
            setSelectedVariant(variant);
          }
          setIsBuyingNow(true);
          try {
            const sessionData = {
              listingId,
              quantity,
            };
            if (variant?._id) {
              sessionData.variantId = variant._id;
            }
            await dispatch(createSessionFromListing(sessionData)).unwrap();
            navigate(ROUTES.CHECKOUT.INDEX);
            success("Redirecting to checkout...");
          } catch (error) {
            showError(
              error.message || "Failed to start checkout. Please try again.",
            );
          } finally {
            setIsBuyingNow(false);
          }
        }}
      />

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
