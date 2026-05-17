import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Grid,
  Skeleton,
  Divider,
  TextField,
  InputAdornment,
  Chip,
  Pagination,
  useMediaQuery,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Store,
  Email,
  CalendarToday,
  Star,
  Verified,
  Search,
  Category as CategoryIcon,
  TrendingUp,
  FilterList,
  WhatsApp,
  Phone,
  Chat as ChatIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { useMerchant } from "../../features/merchant/hooks/useMerchant";
import { useDispatch, useSelector } from "react-redux";
import { fetchSellerListings } from "../../features/listing/store/listingSlice";
import ShopStatusBadge from "../../features/merchant/components/ShopStatusBadge";
import ListingGrid from "../../features/listing/components/ListingGrid";
import { ROUTES } from "../../constants/routes";
import {
  LISTING_CATEGORIES,
  CATEGORY_LABELS,
} from "../../constants/listingConstant";
import { useChatActions } from "../../features/chat/hooks/useChatActions";
import { useAuth } from "../../features/auth/hooks/useAuth";
import ListingCard from "../../features/listing/components/ListingCard";
import ListingListItem from "../../features/listing/components/ListingListItem";
import ListingListItemSkeleton from "../../components/ui/Skeleton/ListingListItemSkeleton";
import ListingCardSkeleton from "../../components/ui/Skeleton/ListingCardSkeleton";
import EmptyState from "../../components/common/EmptyState";

/**
 * ShopProfilePage Component
 *
 * PURPOSE: Public shop profile view
 * ROUTE: /merchants/:shopSlug
 * FEATURES:
 * - Display shop information
 * - Show shop branding (logo, banner)
 * - List shop products
 * - Show ratings and reviews
 */

function ShopProfilePage() {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { viewedShop, isLoading, error, loadShopBySlug, clearShopView } =
    useMerchant();
  const { isAuthenticated, user } = useAuth();
  const { startConversation: initiateChat, actionLoading: chatLoading } =
    useChatActions();

  // Scroll to top when shop slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [shopSlug]);

  // Get listings from Redux store
  const {
    listings,
    pagination,
    isLoading: isLoadingListings,
  } = useSelector((state) => state.listing);

  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("-createdAt");

  // Format phone number to Malaysian WhatsApp format
  const formatWhatsAppNumber = (phoneNumber) => {
    if (!phoneNumber) return null;

    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "");

    // Handle Malaysian formats
    // If starts with 0, replace with 60
    if (cleaned.startsWith("0")) {
      cleaned = "60" + cleaned.substring(1);
    }
    // If starts with 6 but not 60, add 0
    else if (cleaned.startsWith("6") && !cleaned.startsWith("60")) {
      cleaned = "60" + cleaned;
    }
    // If doesn't start with country code, add 60
    else if (!cleaned.startsWith("60")) {
      cleaned = "60" + cleaned;
    }

    return cleaned;
  };

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    const phoneNumber = merchant?.profile?.phoneNumber;
    const whatsappNumber = formatWhatsAppNumber(phoneNumber);

    if (!whatsappNumber) {
      return;
    }

    const message = `Hi! I'm interested in your listings at ${shop.shopName}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Handle in-app chat with merchant
  const handleMessageMerchant = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.AUTH.LOGIN, {
        state: { from: window.location.pathname },
      });
      return;
    }

    const merchantUserId = viewedShop?.merchant?._id;
    if (!merchantUserId) return;

    const result = await initiateChat({
      recipientId: merchantUserId.toString(),
    });

    if (result) {
      const convoId = result.conversation?._id || result._id;
      navigate(ROUTES.CHAT.DETAIL(convoId));
    }
  };

  // Load shop on mount
  useEffect(() => {
    if (shopSlug) {
      loadShopBySlug(shopSlug).catch((err) => {
        console.error("Failed to load shop:", err);
      });
    }

    // Cleanup on unmount
    return () => {
      clearShopView();
    };
  }, [shopSlug, loadShopBySlug, clearShopView]);

  // Track shop view with session-based throttling (once per session)
  useEffect(() => {
    if (shopSlug && viewedShop) {
      // Check if view was already tracked in this session
      const sessionKey = `shop_view_${shopSlug}`;
      const hasTrackedView = sessionStorage.getItem(sessionKey);

      if (!hasTrackedView) {
        // Track view after shop is loaded (to ensure it exists)
        import("../../features/merchant/service/merchantService")
          .then((module) => {
            module.default.trackShopView(shopSlug);
            // Mark as tracked for this session
            sessionStorage.setItem(sessionKey, "true");
          })
          .catch((err) => console.warn("Failed to track view:", err));
      }
    }
  }, [shopSlug, viewedShop]);

  // Load listings when shop is loaded or filters change
  useEffect(() => {
    if (viewedShop?.merchant?._id) {
      const params = {
        page: currentPage,
        limit: 12,
        sort: sortOption,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;

      dispatch(
        fetchSellerListings({ sellerId: viewedShop.merchant._id, params }),
      );
    }
  }, [
    viewedShop,
    currentPage,
    sortOption,
    searchQuery,
    selectedCategory,
    dispatch,
  ]);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    setCurrentPage(1);
  };

  // Handle sort
  const handleSortChange = (sort) => {
    setSortOption(sort);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetryLoadShop = () => {
    if (!shopSlug) return;
    loadShopBySlug(shopSlug).catch((err) => {
      console.error("Failed to retry shop load:", err);
    });
  };

  const clearSearchAndCategoryFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  const isShopNotFound =
    error?.statusCode === 404 ||
    error?.type === "not_found" ||
    (!isLoading && !error && !viewedShop);
  const isShopAccessRestricted =
    error?.statusCode === 401 ||
    error?.statusCode === 403 ||
    error?.type === "authentication" ||
    error?.type === "authorization";
  const hasShopLoadError = Boolean(error) && !isShopNotFound;

  // Shop not found state
  if (isShopNotFound) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <EmptyState
          icon={<Store />}
          title="Shop not found"
          description="This shop may have been removed, renamed, or is no longer available."
          actionLabel="Browse listings"
          onAction={() => navigate(ROUTES.LISTINGS.ALL)}
        />
        <Button
          variant="text"
          onClick={() => navigate(ROUTES.HOME)}
          sx={{ display: "block", mx: "auto", mt: -2 }}
        >
          Go home
        </Button>
      </Container>
    );
  }

  // Error state (network/server/unknown + access restrictions)
  if (hasShopLoadError) {
    const errorTitle = isShopAccessRestricted
      ? "Unable to access shop"
      : "Unable to load shop";
    const errorDescription = isShopAccessRestricted
      ? "This shop is currently unavailable or restricted."
      : "We couldn't load this shop right now. Please check your connection and try again.";

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <EmptyState
          icon={<Store />}
          title={errorTitle}
          description={errorDescription}
          actionLabel="Try again"
          onAction={handleRetryLoadShop}
        />
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mt: -2, flexWrap: "wrap" }}
        >
          <Button variant="text" onClick={() => navigate(ROUTES.LISTINGS.ALL)}>
            Browse listings
          </Button>
          <Button variant="text" onClick={() => navigate(ROUTES.HOME)}>
            Go home
          </Button>
        </Stack>
      </Container>
    );
  }

  // Defensive fallback for unexpected missing shop payload
  if (!viewedShop) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <EmptyState
          icon={<Store />}
          title="Shop not found"
          description="This shop may have been removed, renamed, or is no longer available."
          actionLabel="Browse listings"
          onAction={() => navigate(ROUTES.LISTINGS.ALL)}
        />
        <Button
          variant="text"
          onClick={() => navigate(ROUTES.HOME)}
          sx={{ display: "block", mx: "auto", mt: -2 }}
        >
          Go home
        </Button>
      </Container>
    );
  }

  const { shop, merchant } = viewedShop;

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: isMobile ? 2 : 3 }}>
      {/* Shop Banner */}
      {shop.shopBanner && (
        <Box
          sx={{
            width: "100%",
            height: 250,
            borderRadius: 2,
            overflow: "hidden",
            mb: 3,
            backgroundImage: `url(${shop.shopBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Shop Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {isMobile ? (
            // Mobile Layout - Vertical Stack
            <Stack spacing={2} alignItems="center">
              {/* Shop Logo - Full width centered */}
              <Avatar
                src={shop.shopLogo}
                alt={shop.shopName}
                sx={{
                  width: 100,
                  height: 100,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: 3,
                }}
              >
                <Store sx={{ fontSize: 50 }} />
              </Avatar>

              {/* Shop Name with Badge - Full width centered */}
              <Box sx={{ textAlign: "center", width: "100%" }}>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  {shop.shopName}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <ShopStatusBadge
                    verificationStatus={shop.verificationStatus}
                    shopStatus={shop.shopStatus}
                  />
                </Box>
              </Box>

              {/* Description - Full width */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", width: "100%" }}
              >
                {shop.shopDescription || "Welcome to our shop!"}
              </Typography>

              {/* Shop Stats - Row layout for mobile */}
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                justifyContent="center"
                sx={{ width: "100%" }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Star
                      sx={{ fontSize: 18, color: theme.palette.warning.main }}
                    />
                    <Typography variant="body2">
                      <strong>
                        {shop.shopRating?.averageRating?.toFixed(1) || "0.0"}
                      </strong>
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {shop.shopRating?.totalReviews || 0} reviews
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2">
                    <strong>
                      {shop.shopMetrics?.totalListings ||
                        shop.shopMetrics?.totalProducts ||
                        0}
                    </strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Listings
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2">
                    <strong>{shop.shopMetrics?.totalSales || 0}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sales
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2">
                    <strong>
                      {shop.shopMetrics?.totalViews?.toLocaleString() || 0}
                    </strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Views
                  </Typography>
                </Box>
              </Stack>

              {/* Contact Information */}
              <Box sx={{ width: "100%", textAlign: "center" }}>
                {/* Business Email */}
                {shop.businessEmail && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {shop.businessEmail}
                    </Typography>
                  </Box>
                )}

                {/* Phone Number */}
                {merchant?.profile?.phoneNumber && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {merchant.profile.phoneNumber}
                    </Typography>
                  </Box>
                )}

                {/* WhatsApp Contact Button */}
                {merchant?.profile?.phoneNumber && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<WhatsApp />}
                    size="large"
                    onClick={handleWhatsAppContact}
                    sx={{
                      bgcolor: "#25D366",
                      "&:hover": {
                        bgcolor: "#128C7E",
                      },
                    }}
                  >
                    Contact via WhatsApp
                  </Button>
                )}

                {/* In-App Message Button */}
                {isAuthenticated &&
                  String(user?._id) !== String(viewedShop?.merchant?._id) && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ChatIcon />}
                      size="large"
                      onClick={handleMessageMerchant}
                      disabled={chatLoading === "start"}
                    >
                      {chatLoading === "start" ? "Opening..." : "Send Message"}
                    </Button>
                  )}
              </Box>
            </Stack>
          ) : (
            // Desktop Layout - Horizontal
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 3,
              }}
            >
              {/* Shop Logo */}
              <Avatar
                src={shop.shopLogo}
                alt={shop.shopName}
                sx={{
                  width: 120,
                  height: 120,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: 3,
                }}
              >
                <Store sx={{ fontSize: 60 }} />
              </Avatar>

              {/* Shop Info */}
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{ fontWeight: 600 }}
                  >
                    {shop.shopName}
                  </Typography>
                  <ShopStatusBadge
                    verificationStatus={shop.verificationStatus}
                    shopStatus={shop.shopStatus}
                  />
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {shop.shopDescription || "Welcome to our shop!"}
                </Typography>

                {/* Shop Stats */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Star
                        sx={{ fontSize: 20, color: theme.palette.warning.main }}
                      />
                      <Typography variant="body2">
                        <strong>
                          {shop.shopRating?.averageRating?.toFixed(1) || "0.0"}
                        </strong>{" "}
                        ({shop.shopRating?.totalReviews || 0} reviews)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid>
                    <Typography variant="body2" color="text.secondary">
                      <strong>
                        {shop.shopMetrics?.totalListings ||
                          shop.shopMetrics?.totalProducts ||
                          0}
                      </strong>{" "}
                      Listings
                    </Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{shop.shopMetrics?.totalSales || 0}</strong> Sales
                    </Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="body2" color="text.secondary">
                      <strong>
                        {shop.shopMetrics?.totalViews?.toLocaleString() || 0}
                      </strong>{" "}
                      Views
                    </Typography>
                  </Grid>
                </Grid>

                {/* Contact Information */}
                {(shop.businessEmail || merchant?.profile?.phoneNumber) && (
                  <Box sx={{ mb: 2 }}>
                    {/* Business Email */}
                    {shop.businessEmail && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Email sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {shop.businessEmail}
                        </Typography>
                      </Box>
                    )}

                    {/* Phone Number */}
                    {merchant?.profile?.phoneNumber && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Phone sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {merchant.profile.phoneNumber}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* WhatsApp Contact Button */}
                {merchant?.profile?.phoneNumber && (
                  <Button
                    variant="contained"
                    startIcon={<WhatsApp />}
                    onClick={handleWhatsAppContact}
                    sx={{
                      bgcolor: "#25D366",
                      "&:hover": {
                        bgcolor: "#128C7E",
                      },
                    }}
                  >
                    Contact via WhatsApp
                  </Button>
                )}

                {/* In-App Message Button */}
                {isAuthenticated &&
                  String(user?._id) !== String(viewedShop?.merchant?._id) && (
                    <Button
                      variant="outlined"
                      startIcon={<ChatIcon />}
                      onClick={handleMessageMerchant}
                      disabled={chatLoading === "start"}
                      sx={{ ml: merchant?.profile?.phoneNumber ? 1 : 0 }}
                    >
                      {chatLoading === "start" ? "Opening..." : "Send Message"}
                    </Button>
                  )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Shop Products Section */}
      <Card>
        <CardContent sx={{ px: isMobile ? 1 : 3, py: isMobile ? 2 : 3 }}>
          {/* Header with Search and Filters */}
          <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, fontSize: isMobile ? "1rem" : "1.25rem" }}
            >
              Listings from this Shop
            </Typography>

            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search listings..."
              value={searchQuery}
              onChange={handleSearch}
              inputProps={{ "aria-label": "Search shop listings" }}
              size={isMobile ? "small" : "medium"}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: isMobile ? 18 : 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                mt: { xs: 1.5, md: 2 },
                mb: { xs: 1.5, md: 2 },
                "& .MuiInputBase-input": {
                  fontSize: isMobile ? "0.875rem" : "1rem",
                },
              }}
            />

            {/* Filters Row - Dropdowns */}
            <Stack
              direction="row"
              spacing={isMobile ? 0.5 : 1}
              sx={{ mb: { xs: 1.5, md: 2 }, width: "100%" }}
              alignItems="center"
            >
              {/* Category Filter Dropdown */}
              <FormControl fullWidth size={isMobile ? "small" : "small"}>
                <InputLabel
                  id="category-filter-label"
                  sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                >
                  Category
                </InputLabel>
                <Select
                  labelId="category-filter-label"
                  id="category-filter"
                  value={selectedCategory}
                  label="Category"
                  inputProps={{ "aria-label": "Filter shop listings by category" }}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    "& .MuiSelect-select": {
                      py: isMobile ? 0.75 : 1,
                    },
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  <MenuItem
                    disabled
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    Products
                  </MenuItem>
                  {LISTING_CATEGORIES.PRODUCT.map((category) => (
                    <MenuItem
                      key={category.value}
                      value={category.value}
                      sx={{ pl: 4 }}
                    >
                      {category.label}
                    </MenuItem>
                  ))}
                  <MenuItem
                    disabled
                    sx={{ fontWeight: 600, color: "secondary.main", mt: 1 }}
                  >
                    Services
                  </MenuItem>
                  {LISTING_CATEGORIES.SERVICE.map((category) => (
                    <MenuItem
                      key={category.value}
                      value={category.value}
                      sx={{ pl: 4 }}
                    >
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Sort Options Dropdown */}
              <FormControl fullWidth size={isMobile ? "small" : "small"}>
                <InputLabel
                  id="sort-filter-label"
                  sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                >
                  Sort By
                </InputLabel>
                <Select
                  labelId="sort-filter-label"
                  id="sort-filter"
                  value={sortOption}
                  label="Sort By"
                  inputProps={{ "aria-label": "Sort shop listings" }}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setCurrentPage(1);
                  }}
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    "& .MuiSelect-select": {
                      py: isMobile ? 0.75 : 1,
                    },
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <TrendingUp sx={{ fontSize: isMobile ? 16 : 18 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem
                    value="-createdAt"
                    sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                  >
                    Newest First
                  </MenuItem>
                  <MenuItem
                    value="price"
                    sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                  >
                    Price: Low to High
                  </MenuItem>
                  <MenuItem
                    value="-price"
                    sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                  >
                    Price: High to Low
                  </MenuItem>
                  <MenuItem
                    value="-views"
                    sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                  >
                    Most Popular
                  </MenuItem>
                  <MenuItem
                    value="name"
                    sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                  >
                    Name: A to Z
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Active Filters Display - Below dropdowns on mobile */}
            {(selectedCategory || searchQuery) && (
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  alignItems: "center",
                  flexWrap: "wrap",
                  mt: 1,
                }}
              >
                {selectedCategory && (
                  <Chip
                    label={CATEGORY_LABELS[selectedCategory]}
                    onDelete={() => {
                      setSelectedCategory("");
                      setCurrentPage(1);
                    }}
                    size="small"
                    color="primary"
                    sx={{
                      height: isMobile ? 24 : 28,
                      fontSize: isMobile ? "0.7rem" : "0.8125rem",
                    }}
                  />
                )}
                {searchQuery && (
                  <Chip
                    label={`"${searchQuery}"`}
                    onDelete={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    size="small"
                    color="primary"
                    sx={{
                      height: isMobile ? 24 : 28,
                      fontSize: isMobile ? "0.7rem" : "0.8125rem",
                    }}
                  />
                )}
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Listings Display */}
          {isLoadingListings ? (
            <Box sx={{ py: 4 }}>
              {isMobile ? (
                <Stack spacing={1.25} sx={{ mx: -0.5 }}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ListingListItemSkeleton key={`shop-listing-list-skeleton-${index}`} />
                  ))}
                </Stack>
              ) : (
                <Grid container spacing={3}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                      <ListingCardSkeleton />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ) : listings && listings.length > 0 ? (
            <>
              {/* List view for mobile, Grid for desktop */}
              {isMobile ? (
                <Stack spacing={1.25} sx={{ mx: -0.5, mt: 0.5 }} role="list">
                  {listings.map((listing) => (
                    <Box key={listing._id} role="listitem">
                      <ListingListItem listing={listing} hideSellerInfo />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Grid container spacing={3}>
                  {listings.map((listing) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={listing._id}>
                      <ListingCard listing={listing} hideSellerInfo />
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 4,
                  }}
                >
                  <Pagination
                    count={pagination.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "medium" : "large"}
                    showFirstButton={!isMobile}
                    showLastButton={!isMobile}
                    siblingCount={isMobile ? 0 : 1}
                  />
                </Box>
              )}

              {/* Results Info */}
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 2 }}
              >
                {pagination && pagination.totalItems > 0
                  ? `Showing ${(currentPage - 1) * pagination.limit + 1}-${Math.min(
                      currentPage * pagination.limit,
                      pagination.totalItems,
                    )} of ${pagination.totalItems} listing${
                      pagination.totalItems !== 1 ? "s" : ""
                    }`
                  : `Showing ${listings.length} listing${
                      listings.length !== 1 ? "s" : ""
                    }`}
              </Typography>
            </>
          ) : (
            <EmptyState
              icon={<Store />}
              title="No listings found"
              description={
                searchQuery || selectedCategory
                  ? "No listings match your current search or category filter."
                  : "This shop hasn't listed any products or services yet."
              }
              actionLabel={
                searchQuery || selectedCategory ? "Clear search & filters" : null
              }
              onAction={
                searchQuery || selectedCategory
                  ? clearSearchAndCategoryFilters
                  : null
              }
              sx={{ py: 8 }}
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default ShopProfilePage;
