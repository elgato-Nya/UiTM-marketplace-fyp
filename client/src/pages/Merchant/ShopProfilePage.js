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
  Alert,
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
import ListingCard from "../../features/listing/components/ListingCard";
import ListingListItem from "../../features/listing/components/ListingListItem";

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

    const message = `Hi! I'm interested in your products at ${shop.shopName}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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
        fetchSellerListings({ sellerId: viewedShop.merchant._id, params })
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

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || "Failed to load shop"}
        </Alert>
        <Button variant="contained" onClick={() => navigate(ROUTES.HOME)}>
          Go Back Home
        </Button>
      </Container>
    );
  }

  // No shop found
  if (!viewedShop) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Shop not found</Alert>
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
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Shop Products Section */}
      <Card>
        <CardContent sx={{ px: isMobile ? 1.5 : 3, py: isMobile ? 2 : 3 }}>
          {/* Header with Search and Filters */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, fontSize: isMobile ? "1rem" : "1.25rem" }}
            >
              Products from this Shop
            </Typography>

            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
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
                mt: 2,
                mb: 2,
                "& .MuiInputBase-input": {
                  fontSize: isMobile ? "0.875rem" : "1rem",
                },
              }}
            />

            {/* Filters Row - Dropdowns */}
            <Stack
              direction="row"
              spacing={isMobile ? 0.5 : 1}
              sx={{ mb: 2, width: "100%" }}
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
              <Grid container spacing={isMobile ? 1 : 3}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                    <Skeleton variant="rectangular" height={250} />
                    <Skeleton variant="text" sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="60%" />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : listings && listings.length > 0 ? (
            <>
              {/* List view for mobile, Grid for desktop */}
              {isMobile ? (
                <Stack spacing={2}>
                  {listings.map((listing) => (
                    <ListingListItem key={listing._id} listing={listing} />
                  ))}
                </Stack>
              ) : (
                <Grid container spacing={3}>
                  {listings.map((listing) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={listing._id}>
                      <ListingCard listing={listing} />
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
                      pagination.totalItems
                    )} of ${pagination.totalItems} listing${
                      pagination.totalItems !== 1 ? "s" : ""
                    }`
                  : `Showing ${listings.length} listing${
                      listings.length !== 1 ? "s" : ""
                    }`}
              </Typography>
            </>
          ) : (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Store sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No listings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery || selectedCategory
                  ? "Try adjusting your search or filters"
                  : "This shop hasn't listed any products or services yet"}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default ShopProfilePage;
