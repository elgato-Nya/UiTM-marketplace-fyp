import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  ImageNotSupported as NoImageIcon,
  Inventory2Outlined as InventoryIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
  DeleteOutline as DeleteOutlineIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";

import { CATEGORY_LABELS } from "../../../constants/listingConstant";
import { ROUTES } from "../../../constants/routes";
import { useTheme } from "../../../hooks/useTheme";

const LOW_STOCK_THRESHOLD = 5;

const formatPrice = (priceValue) => {
  const safePrice = Number(priceValue) || 0;

  if (safePrice >= 100000) {
    if (safePrice >= 1000000000) {
      return `RM${(safePrice / 1000000000).toFixed(1)}b`;
    }
    if (safePrice >= 1000000) {
      return `RM${(safePrice / 1000000).toFixed(1)}m`;
    }
    return `RM${(safePrice / 1000).toFixed(1)}k`;
  }

  const parts = safePrice.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `RM${parts.join(".")}`;
};

const formatStockLabel = (stockValue) => {
  const safeStock = Number(stockValue) || 0;

  if (safeStock === 0) return "Out of stock";
  if (safeStock >= 1000000) return `${(safeStock / 1000000).toFixed(1)}m in stock`;
  if (safeStock >= 1000) return `${(safeStock / 1000).toFixed(1)}k in stock`;
  if (safeStock === 1) return "1 in stock";
  return `${safeStock} in stock`;
};

const MerchantListingCard = ({
  listing,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [hasImageError, setHasImageError] = useState(false);

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
    variants,
  } = listing;

  const hasVariants = Array.isArray(variants) && variants.length > 0;
  const isProduct = type === "product";
  const isBaseFree = !hasVariants && isFree;
  const availableVariants = useMemo(
    () => (hasVariants ? variants.filter((variant) => variant.isAvailable !== false) : []),
    [hasVariants, variants],
  );

  const variantCount = variants?.length || 0;
  const displayStock = useMemo(() => {
    if (!hasVariants) {
      return Number(stock) || 0;
    }

    return availableVariants.reduce(
      (total, variant) => total + (Number(variant.stock) || 0),
      0,
    );
  }, [availableVariants, hasVariants, stock]);

  const displayPrice = useMemo(() => {
    if (isBaseFree) return 0;
    if (!hasVariants) return Number(price) || 0;

    const availablePrices = availableVariants
      .map((variant) => Number(variant.price) || 0)
      .filter((variantPrice) => variantPrice > 0);

    if (availablePrices.length === 0) {
      return Number(price) || 0;
    }

    return Math.min(...availablePrices);
  }, [availableVariants, hasVariants, isBaseFree, price]);

  const stockStatus = useMemo(() => {
    if (!isProduct) return null;
    if (displayStock <= 0) return "out";
    if (displayStock <= LOW_STOCK_THRESHOLD) return "low";
    return "healthy";
  }, [displayStock, isProduct]);

  const primaryImage = images?.[0];
  const imageSrc =
    typeof primaryImage === "string" ? primaryImage : primaryImage?.url;
  const hasValidImage = Boolean(imageSrc) && !hasImageError;
  const menuOpen = Boolean(menuAnchorEl);

  const handlePreview = () => {
    navigate(ROUTES.LISTINGS.DETAIL(_id));
    setMenuAnchorEl(null);
  };

  const handleOpenMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleToggle = () => {
    onToggle?.(_id);
    handleCloseMenu();
  };

  const handleDelete = () => {
    onDelete?.(_id);
    handleCloseMenu();
  };

  const handleEdit = () => {
    onEdit?.(_id);
  };

  const statusChips = [
    {
      label: isAvailable ? "Active" : "Archived or unavailable",
      color: isAvailable ? "success" : "default",
      variant: isAvailable ? "filled" : "outlined",
    },
    hasVariants
      ? {
          label: "Variant",
          color: "secondary",
          variant: "outlined",
          icon: <TuneIcon />,
        }
      : null,
    stockStatus === "out"
      ? {
          label: "Out of stock",
          color: "warning",
          variant: "filled",
        }
      : null,
    stockStatus === "low"
      ? {
          label: "Low stock",
          color: "warning",
          variant: "outlined",
        }
      : null,
    isBaseFree
      ? {
          label: "Free",
          color: "success",
          variant: "outlined",
        }
      : null,
  ].filter(Boolean);

  const metricItems = [
    {
      label: hasVariants ? "From price" : "Price",
      value: isBaseFree ? "FREE" : formatPrice(hasVariants ? displayPrice : price),
      accent: "primary.main",
    },
    {
      label: isProduct ? (hasVariants ? "Total variant stock" : "Stock") : "Category",
      value: isProduct
        ? formatStockLabel(displayStock)
        : CATEGORY_LABELS[category] || category || "Uncategorized",
      icon: isProduct ? <InventoryIcon sx={{ fontSize: 15 }} /> : null,
    },
    hasVariants
      ? {
          label: "Variants",
          value: `${variantCount}`,
          accent: "text.primary",
        }
      : {
          label: "Type",
          value: type === "service" ? "Service" : "Product",
          accent: "text.primary",
      },
  ];

  const mobileMetricChips = [
    isBaseFree ? "FREE" : `${hasVariants ? "From " : ""}${formatPrice(hasVariants ? displayPrice : price)}`,
    isProduct ? formatStockLabel(displayStock) : type === "service" ? "Service" : "Product",
    hasVariants ? `${variantCount} variants` : null,
  ].filter(Boolean);

  if (isMobile) {
    return (
      <>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            borderColor: isAvailable ? "divider" : "action.selected",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", gap: 1.25, p: 1.25, alignItems: "stretch" }}>
            <Box
              sx={{
                width: 124,
                minWidth: 124,
                borderRadius: 2.5,
                overflow: "hidden",
                position: "relative",
                bgcolor: hasValidImage ? "transparent" : "background.default",
                aspectRatio: "1 / 1",
              }}
            >
              {hasValidImage ? (
                <CardMedia
                  component="img"
                  image={imageSrc}
                  alt={name}
                  onError={() => setHasImageError(true)}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "text.disabled",
                    gap: 0.5,
                    px: 1,
                  }}
                >
                  <NoImageIcon sx={{ fontSize: 30 }} />
                  <Typography variant="caption">No image</Typography>
                </Box>
              )}

              <Chip
                size="small"
                label={type === "service" ? "Service" : "Product"}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "rgba(18, 18, 18, 0.72)",
                  color: "#fff",
                  fontWeight: 700,
                  height: 24,
                }}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {statusChips.slice(0, 3).map((chip) => (
                    <Chip
                      key={chip.label}
                      size="small"
                      label={chip.label}
                      color={chip.color}
                      variant={chip.variant}
                      icon={chip.icon}
                    />
                  ))}
                </Stack>

                <IconButton
                  size="small"
                  aria-label={`Open actions for ${name}`}
                  aria-controls={menuOpen ? `listing-actions-${_id}` : undefined}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen ? "true" : undefined}
                  onClick={handleOpenMenu}
                  sx={{ mt: -0.5, mr: -0.5 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.25,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {CATEGORY_LABELS[category] || category || "Uncategorized"}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {description || "No description added yet."}
              </Typography>

              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {mobileMetricChips.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: 999,
                      "& .MuiChip-label": {
                        px: 1,
                        fontWeight: 600,
                      },
                    }}
                  />
                ))}
              </Stack>

              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                aria-label={`Edit ${name}`}
                sx={{ mt: "auto", borderRadius: 2 }}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </Card>

        <Menu
          id={`listing-actions-${_id}`}
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleCloseMenu}
          MenuListProps={{
            "aria-label": `Actions for ${name}`,
          }}
        >
          <MenuItem onClick={handlePreview}>
            <OpenInNewIcon fontSize="small" sx={{ mr: 1.25 }} />
            Preview
          </MenuItem>
          <MenuItem onClick={handleToggle}>
            {isAvailable ? (
              <VisibilityOffIcon fontSize="small" sx={{ mr: 1.25 }} />
            ) : (
              <VisibilityIcon fontSize="small" sx={{ mr: 1.25 }} />
            )}
            {isAvailable ? "Archive listing" : "Restore listing"}
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1.25 }} />
            Delete listing
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        minHeight: 312,
        borderRadius: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: { sm: "row" },
        borderColor: isAvailable ? "divider" : "action.selected",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))"
            : "linear-gradient(180deg, rgba(25,118,210,0.03), rgba(255,255,255,0))",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", sm: 188, md: 196 },
          minWidth: { sm: 188, md: 196 },
          position: "relative",
          bgcolor: hasValidImage ? "transparent" : "background.default",
        }}
      >
        {hasValidImage ? (
          <CardMedia
            component="img"
            image={imageSrc}
            alt={name}
            onError={() => setHasImageError(true)}
            sx={{
              width: "100%",
              height: "100%",
              minHeight: { xs: 180, sm: "100%" },
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : (
          <Box
            sx={{
              minHeight: { xs: 180, sm: "100%" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "text.disabled",
              gap: 1,
              px: 2,
            }}
          >
            <NoImageIcon sx={{ fontSize: 42 }} />
            <Typography variant="caption">No image</Typography>
          </Box>
        )}

        <Chip
          size="small"
          label={type === "service" ? "Service" : "Product"}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "rgba(18, 18, 18, 0.72)",
            color: "#fff",
            fontWeight: 700,
            height: 28,
          }}
        />
      </Box>

      <CardContent
        sx={{
          flex: 1,
          p: { xs: 2, sm: 2, md: 2.25 },
          display: "flex",
          flexDirection: "column",
          gap: 1.35,
          "&:last-child": { pb: { xs: 2, sm: 2, md: 2.25 } },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {statusChips.map((chip) => (
                <Chip
                  key={chip.label}
                  size="small"
                  label={chip.label}
                  color={chip.color}
                  variant={chip.variant}
                  icon={chip.icon}
                />
              ))}
            </Stack>

            <Typography
              variant="h6"
              component="h2"
              sx={{
                mt: 0.9,
                fontWeight: 700,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {name}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.45 }}>
              {CATEGORY_LABELS[category] || category || "Uncategorized"}
            </Typography>
          </Box>

          <IconButton
            aria-label={`Open actions for ${name}`}
            aria-controls={menuOpen ? `listing-actions-${_id}` : undefined}
            aria-haspopup="menu"
            aria-expanded={menuOpen ? "true" : undefined}
            onClick={handleOpenMenu}
          >
            <MoreVertIcon />
          </IconButton>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minHeight: { xs: "auto", sm: 32 },
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description || "No description added yet."}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gap: 1,
          }}
        >
          {metricItems.map((item) => (
            <Box
              key={item.label}
              sx={{
                borderRadius: 2,
                px: 1.2,
                py: 1.05,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                minHeight: 72,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Stack direction="row" spacing={0.65} alignItems="center" sx={{ mt: 0.55, minWidth: 0 }}>
                {item.icon ? (
                  <Box sx={{ color: "text.secondary", display: "inline-flex", flexShrink: 0 }}>
                    {item.icon}
                  </Box>
                ) : null}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: item.accent || "text.primary",
                    lineHeight: 1.25,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {item.value}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: "divider", opacity: 0.6 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          sx={{ mt: "auto" }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 360 }}>
            {isAvailable
              ? "Visible in your dashboard and available to buyers."
              : "Hidden from buyers until you restore availability."}
          </Typography>

          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            aria-label={`Edit ${name}`}
            sx={{
              alignSelf: { xs: "stretch", sm: "center" },
              minWidth: 108,
              px: 2,
              borderRadius: 2,
            }}
          >
            Edit
          </Button>
        </Stack>
      </CardContent>

      <Menu
        id={`listing-actions-${_id}`}
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        MenuListProps={{
          "aria-label": `Actions for ${name}`,
        }}
      >
        <MenuItem onClick={handlePreview}>
          <OpenInNewIcon fontSize="small" sx={{ mr: 1.25 }} />
          Preview
        </MenuItem>
        <MenuItem onClick={handleToggle}>
          {isAvailable ? (
            <VisibilityOffIcon fontSize="small" sx={{ mr: 1.25 }} />
          ) : (
            <VisibilityIcon fontSize="small" sx={{ mr: 1.25 }} />
          )}
          {isAvailable ? "Archive listing" : "Restore listing"}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1.25 }} />
          Delete listing
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default MerchantListingCard;
