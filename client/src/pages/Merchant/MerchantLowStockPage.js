import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  Grid,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  ImageNotSupported as NoImageIcon,
  Inventory2Outlined as InventoryIcon,
  WarningAmberOutlined as WarningIcon,
} from "@mui/icons-material";

import EmptyState from "../../components/common/EmptyState";
import ErrorAlert from "../../components/common/Alert/ErrorAlert";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import { ROUTES } from "../../constants/routes";
import { CATEGORY_LABELS } from "../../constants/listingConstant";
import analyticsService from "../../features/analytic/service/analyticsService";
import { useTheme } from "../../hooks/useTheme";

const LIMIT_OPTIONS = [10, 20, 50];
const DEFAULT_PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  hasNextPage: false,
  hasPrevPage: false,
  limit: LIMIT_OPTIONS[0],
};

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const formatAttributes = (attributes = {}) => {
  const entries = Object.entries(attributes).filter(([, value]) => value);
  if (entries.length === 0) return null;
  return entries.map(([key, value]) => `${key}: ${value}`).join(" / ");
};

const DEFAULT_VISIBLE_VARIANTS = 3;

const MerchantLowStockPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState({
    items: [],
    pagination: DEFAULT_PAGINATION,
    threshold: 5,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedListings, setExpandedListings] = useState({});

  const currentPage = parsePositiveInt(searchParams.get("page"), 1);
  const limit = useMemo(() => {
    const requestedLimit = parsePositiveInt(searchParams.get("limit"), 10);
    return LIMIT_OPTIONS.includes(requestedLimit) ? requestedLimit : 10;
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadLowStockInventory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await analyticsService.getMerchantLowStockInventory({
          page: currentPage,
          limit,
        });

        if (!isMounted) return;

        setState({
          items: response.data?.items || [],
          pagination: response.data?.pagination || DEFAULT_PAGINATION,
          threshold: response.data?.threshold || 5,
        });
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLowStockInventory();

    return () => {
      isMounted = false;
    };
  }, [currentPage, limit]);

  const handlePageChange = (_, page) => {
    setSearchParams({
      page: String(page),
      limit: String(limit),
    });
  };

  const handleLimitChange = (event) => {
    setSearchParams({
      page: "1",
      limit: String(event.target.value),
    });
  };

  const handleEdit = (listingId) => {
    navigate(ROUTES.MERCHANT.LISTINGS.EDIT(listingId));
  };

  const handleToggleVariants = (listingId) => {
    setExpandedListings((currentState) => ({
      ...currentState,
      [listingId]: !currentState[listingId],
    }));
  };

  if (isLoading) {
    return (
      <DynamicSkeleton
        type="page"
        config={{
          contentType: "dashboard",
          showHeader: false,
          showSidebar: false,
        }}
      />
    );
  }

  return (
    <Box>
      <Stack spacing={{ xs: 2, md: 3 }}>
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(255,183,77,0.10), rgba(255,255,255,0.02))"
                : "linear-gradient(135deg, rgba(245,124,0,0.10), rgba(255,255,255,0.92))",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Box>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(ROUTES.MERCHANT.DASHBOARD)}
                sx={{ mb: 1, alignSelf: "flex-start" }}
              >
                Back to dashboard
              </Button>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                Low Stock Inventory
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Listings in this view need restocking attention. Low stock means
                stock above 0 and below {state.threshold}.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Chip
                icon={<WarningIcon />}
                label={`${state.pagination.totalItems} listing${
                  state.pagination.totalItems === 1 ? "" : "s"
                } need attention`}
                color="warning"
                variant="outlined"
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={limit} onChange={handleLimitChange}>
                  {LIMIT_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option} / page
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Box>

        <ErrorAlert
          error={error}
          show={!!error}
          fallback="Failed to load low-stock inventory. Please try again."
        />

        {!error && state.items.length === 0 ? (
          <EmptyState
            icon={<InventoryIcon />}
            title="No low-stock items"
            description="Your inventory looks healthy."
            actionLabel="Back to dashboard"
            onAction={() => navigate(ROUTES.MERCHANT.DASHBOARD)}
            sx={{
              minHeight: "42vh",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 3,
              bgcolor: "background.paper",
            }}
          />
        ) : (
          <Grid container spacing={2}>
            {state.items.map((item) => {
              const primaryImage = item.images?.[0];
              const imageSrc =
                typeof primaryImage === "string"
                  ? primaryImage
                  : primaryImage?.url;
              const lowStockVariantCount = item.lowStockVariants?.length || 0;
              const hasExtraVariants =
                lowStockVariantCount > DEFAULT_VISIBLE_VARIANTS;
              const isExpanded = Boolean(expandedListings[item._id]);
              const visibleVariants = isExpanded
                ? item.lowStockVariants
                : item.lowStockVariants.slice(0, DEFAULT_VISIBLE_VARIANTS);

              return (
                <Grid size={{ xs: 12 }} key={item._id}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ xs: "stretch", md: "flex-start" }}
                      >
                        <Box
                          sx={{
                            width: { xs: "100%", md: 172 },
                            minWidth: { md: 172 },
                            borderRadius: 2,
                            overflow: "hidden",
                            bgcolor: "background.default",
                            aspectRatio: { xs: "16 / 9", md: "1 / 1" },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {imageSrc ? (
                            <CardMedia
                              component="img"
                              image={imageSrc}
                              alt={item.name}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center",
                              }}
                            />
                          ) : (
                            <Stack spacing={1} alignItems="center" color="text.disabled">
                              <NoImageIcon sx={{ fontSize: 34 }} />
                              <Typography variant="caption">No image</Typography>
                            </Stack>
                          )}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "flex-start" }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip label="Product" size="small" />
                                <Chip
                                  label={item.isAvailable ? "Active" : "Archived or unavailable"}
                                  size="small"
                                  color={item.isAvailable ? "success" : "default"}
                                  variant={item.isAvailable ? "filled" : "outlined"}
                                />
                                {item.hasVariants ? (
                                  <Chip
                                    label={`${lowStockVariantCount} low-stock variant${
                                      lowStockVariantCount === 1 ? "" : "s"
                                    }`}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                ) : (
                                  <Chip
                                    label={`Base stock: ${item.stock}`}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>

                              <Typography
                                variant="h6"
                                component="h2"
                                sx={{ mt: 1.1, fontWeight: 700 }}
                              >
                                {item.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.4 }}
                              >
                                {CATEGORY_LABELS[item.category] ||
                                  item.category ||
                                  "Uncategorized"}
                              </Typography>
                            </Box>

                            <Button
                              variant="contained"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(item._id)}
                              sx={{
                                alignSelf: { xs: "stretch", sm: "center" },
                                minWidth: { sm: 112 },
                              }}
                            >
                              Edit
                            </Button>
                          </Stack>

                          {item.hasVariants ? (
                            <Box
                              sx={{
                                mt: 2,
                                p: 1.5,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.default",
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Low-stock variants
                              </Typography>
                              <Stack spacing={1}>
                                {visibleVariants.map((variant) => {
                                  const attributeSummary = formatAttributes(
                                    variant.attributes
                                  );

                                  return (
                                    <Box
                                      key={variant._id}
                                      sx={{
                                        p: 1.25,
                                        borderRadius: 2,
                                        bgcolor: "background.paper",
                                        border: "1px solid",
                                        borderColor: "divider",
                                      }}
                                    >
                                      <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={1}
                                        justifyContent="space-between"
                                        alignItems={{ xs: "flex-start", sm: "center" }}
                                      >
                                        <Box sx={{ minWidth: 0 }}>
                                          <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 700 }}
                                          >
                                            {variant.name}
                                          </Typography>
                                          {variant.sku ? (
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              SKU: {variant.sku}
                                            </Typography>
                                          ) : null}
                                          {attributeSummary ? (
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{ display: "block", mt: 0.35 }}
                                            >
                                              {attributeSummary}
                                            </Typography>
                                          ) : null}
                                        </Box>

                                        <Chip
                                          label={`${variant.stock} in stock`}
                                          color="warning"
                                          variant="outlined"
                                          size="small"
                                        />
                                      </Stack>
                                    </Box>
                                  );
                                })}
                              </Stack>

                              {hasExtraVariants ? (
                                <Button
                                  onClick={() => handleToggleVariants(item._id)}
                                  size="small"
                                  startIcon={
                                    isExpanded ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )
                                  }
                                  sx={{
                                    mt: 1,
                                    alignSelf: "flex-start",
                                  }}
                                >
                                  {isExpanded
                                    ? "Show less"
                                    : `Show all variants (${lowStockVariantCount})`}
                                </Button>
                              ) : null}
                            </Box>
                          ) : (
                            <Alert severity="warning" variant="outlined" sx={{ mt: 2 }}>
                              Base stock is at {item.stock}. Restock before it reaches zero.
                            </Alert>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {!error && state.pagination.totalPages > 1 ? (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing page {state.pagination.currentPage} of {state.pagination.totalPages}
            </Typography>
            <Pagination
              count={state.pagination.totalPages}
              page={state.pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "small" : "medium"}
              showFirstButton={!isMobile}
              showLastButton={!isMobile}
            />
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
};

export default MerchantLowStockPage;
