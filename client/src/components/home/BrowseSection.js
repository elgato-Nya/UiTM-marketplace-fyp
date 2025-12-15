import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  ButtonBase,
  Chip,
  Grid,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Checkroom,
  Fastfood,
  MenuBook,
  Print,
  Build,
  DirectionsCar,
  LocalShipping,
  Category,
  ShoppingBag,
  Build as BuildIcon,
  Apps,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { LISTING_CATEGORIES } from "../../constants/listingConstant";

function BrowseSection({ value, onChange, categoryStats = {} }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // Use consistent theme color for all category icons
  const categoryConfig = {
    electronics: { icon: Phone, shortLabel: "Electronics" },
    clothing: { icon: Checkroom, shortLabel: "Clothing" },
    food: { icon: Fastfood, shortLabel: "Food" },
    books: { icon: MenuBook, shortLabel: "Books" },
    other: { icon: Category, shortLabel: "Other" },
    printing: { icon: Print, shortLabel: "Printing" },
    repair: { icon: Build, shortLabel: "Repair" },
    "e-hailing": { icon: DirectionsCar, shortLabel: "Transport" },
    delivery: { icon: LocalShipping, shortLabel: "Delivery" },
    "other-service": { icon: BuildIcon, shortLabel: "Other" },
  };

  const formatCount = (count) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();

  const productCount = categoryStats.product_total || 0;
  const serviceCount = categoryStats.service_total || 0;
  const totalCount = productCount + serviceCount;

  const types = [
    { value: "all", label: "All", icon: Apps, count: totalCount },
    {
      value: "product",
      label: "Products",
      icon: ShoppingBag,
      count: productCount,
    },
    {
      value: "service",
      label: "Services",
      icon: BuildIcon,
      count: serviceCount,
    },
  ];

  const getCategories = () => {
    if (value === "product") return LISTING_CATEGORIES.PRODUCT;
    if (value === "service") return LISTING_CATEGORIES.SERVICE;
    return [...LISTING_CATEGORIES.PRODUCT, ...LISTING_CATEGORIES.SERVICE];
  };

  const categories = getCategories();
  const displayedCategories = expanded ? categories : categories.slice(0, 5);
  const hasMore = categories.length > 5;

  return (
    <Box
      sx={{
        py: { xs: 3, sm: 4, md: 5 },
        bgcolor: "background.default",
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 2.5, sm: 3, md: 4 } }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              fontSize: { xs: "1rem", sm: "1.125rem", md: "1.375rem" },
              letterSpacing: "-0.01em",
            }}
          >
            Browse Marketplace
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.8125rem", md: "0.875rem" },
            }}
          >
            Find exactly what you need
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.75, sm: 1 },
            justifyContent: "center",
            mb: { xs: 2.5, sm: 3, md: 4 },
            px: { xs: 1, sm: 0 },
          }}
        >
          {types.map((type) => {
            const Icon = type.icon;
            const isActive = value === type.value;
            return (
              <ButtonBase
                key={type.value}
                onClick={() => onChange(type.value)}
                sx={{
                  flex: { xs: 1, sm: "0 1 auto" },
                  minWidth: { xs: "auto", sm: 130, md: 140 },
                  px: { xs: 1.5, sm: 2.5, md: 3 },
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: "50px",
                  bgcolor: isActive ? "primary.main" : "background.default",
                  color: isActive ? "white" : "text.primary",
                  border: "1px solid",
                  borderColor: isActive ? "primary.main" : "divider",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: isActive ? "primary.dark" : "action.hover",
                  },
                }}
              >
                <Icon
                  sx={{ fontSize: { xs: 16, sm: 18 }, mr: { xs: 0.5, sm: 1 } }}
                />
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: {
                      xs: "0.6875rem",
                      sm: "0.75rem",
                      md: "0.8125rem",
                    },
                    mr: { xs: 0.5, sm: 0.75 },
                  }}
                >
                  {type.label}
                </Typography>
                <Chip
                  label={formatCount(type.count)}
                  size="small"
                  sx={{
                    height: { xs: 16, sm: 18 },
                    fontSize: { xs: "0.625rem", sm: "0.6875rem" },
                    fontWeight: 700,
                    bgcolor: isActive
                      ? "rgba(255,255,255,0.2)"
                      : "action.selected",
                    color: isActive ? "white" : "text.secondary",
                    "& .MuiChip-label": {
                      px: { xs: 0.75, sm: 1 },
                    },
                  }}
                />
              </ButtonBase>
            );
          })}
        </Box>

        <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2 }}>
          {displayedCategories.map((cat) => {
            const config = categoryConfig[cat.value] || {
              icon: Category,
              shortLabel: cat.label,
            };
            const Icon = config.icon;
            const count = categoryStats[cat.value] || 0;

            const categoryType = LISTING_CATEGORIES.PRODUCT.some(
              (c) => c.value === cat.value
            )
              ? "product"
              : "service";

            return (
              <Grid key={cat.value} size={{ xs: 4, sm: 4, md: 2.4 }}>
                <ButtonBase
                  onClick={() =>
                    navigate(
                      `/browse?type=${categoryType}&category=${cat.value}`
                    )
                  }
                  sx={{
                    width: "100%",
                    p: { xs: 1, sm: 1.5, md: 1.75 },
                    borderRadius: { xs: 1.5, md: 2 },
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: { xs: 0.5, sm: 0.75, md: 1 },
                    minHeight: { xs: 80, sm: 95, md: 100 },
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                      "& .icon-box": {
                        bgcolor: "primary.main",
                        color: "white",
                        transform: "scale(1.05)",
                      },
                    },
                  }}
                >
                  <Box
                    className="icon-box"
                    sx={{
                      width: { xs: 32, sm: 40, md: 44 },
                      height: { xs: 32, sm: 40, md: 44 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: { xs: 1, md: 1.5 },
                      color: "primary.main",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Icon sx={{ fontSize: { xs: 24, md: 28 } }} />
                  </Box>
                  <Box sx={{ textAlign: "center", width: "100%" }}>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: {
                          xs: "0.625rem",
                          sm: "0.6875rem",
                          md: "0.75rem",
                        },
                        mb: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ display: { xs: "inline", md: "none" } }}
                      >
                        {config.shortLabel}
                      </Box>
                      <Box
                        component="span"
                        sx={{ display: { xs: "none", md: "inline" } }}
                      >
                        {cat.label}
                      </Box>
                    </Typography>
                    <Chip
                      label={formatCount(count)}
                      size="small"
                      sx={{
                        height: { xs: 14, sm: 16 },
                        fontSize: { xs: "0.5625rem", sm: "0.625rem" },
                        fontWeight: 600,
                        bgcolor: "action.hover",
                        color: "text.secondary",
                        "& .MuiChip-label": {
                          px: { xs: 0.5, sm: 0.75 },
                        },
                      }}
                    />
                  </Box>
                </ButtonBase>
              </Grid>
            );
          })}
        </Grid>

        {hasMore && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{
                textTransform: "none",
                fontSize: { xs: "0.75rem", md: "0.8125rem" },
                fontWeight: 500,
                color: "primary.main",
              }}
            >
              {expanded
                ? "Show Less"
                : `Show ${categories.length - 5} More Categories`}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default BrowseSection;
