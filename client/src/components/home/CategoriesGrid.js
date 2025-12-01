import React from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  useMediaQuery,
  Button,
} from "@mui/material";
import {
  Phone,
  Computer,
  Checkroom,
  Home,
  SportsEsports,
  MenuBook,
  DirectionsCar,
  Fastfood,
  Print,
  Build,
  LocalShipping,
  Category,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { LISTING_CATEGORIES } from "../../constants/listingConstant";

// Icon mapping for categories
const categoryIcons = {
  electronics: Phone,
  clothing: Checkroom,
  food: Fastfood,
  books: MenuBook,
  other: Category,
  printing: Print,
  repair: Build,
  "e-hailing": DirectionsCar,
  delivery: LocalShipping,
  "other-service": Build,
};

// Color mapping for categories
const categoryColors = {
  electronics: "#1976d2",
  clothing: "#f57c00",
  food: "#388e3c",
  books: "#303f9f",
  other: "#455a64",
  printing: "#1976d2",
  repair: "#388e3c",
  "e-hailing": "#f57c00",
  delivery: "#7b1fa2",
  "other-service": "#d32f2f",
};

// Dynamic categories with support for real counts using constants
const getCategoriesConfig = (listingType) => {
  if (listingType === "product") {
    return LISTING_CATEGORIES.PRODUCT.map((cat) => ({
      id: cat.value,
      name: cat.label,
      icon: categoryIcons[cat.value] || Category,
      color: categoryColors[cat.value] || "#1976d2",
      path: `/browse?type=product&category=${cat.value}`,
    }));
  }

  if (listingType === "service") {
    return LISTING_CATEGORIES.SERVICE.map((cat) => ({
      id: cat.value,
      name: cat.label,
      icon: categoryIcons[cat.value] || Build,
      color: categoryColors[cat.value] || "#388e3c",
      path: `/browse?type=service&category=${cat.value}`,
    }));
  }

  // For "all", show a mix of both
  const productCats = LISTING_CATEGORIES.PRODUCT.slice(0, 4).map((cat) => ({
    id: cat.value,
    name: cat.label,
    icon: categoryIcons[cat.value] || Category,
    color: categoryColors[cat.value] || "#1976d2",
    path: `/browse?type=product&category=${cat.value}`,
  }));

  const serviceCats = LISTING_CATEGORIES.SERVICE.slice(0, 4).map((cat) => ({
    id: cat.value,
    name: cat.label,
    icon: categoryIcons[cat.value] || Build,
    color: categoryColors[cat.value] || "#388e3c",
    path: `/browse?type=service&category=${cat.value}`,
  }));

  return [...productCats, ...serviceCats];
};

function CategoriesGrid({ listingType = "all", categoryStats = {} }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const categories = getCategoriesConfig(listingType);

  const getCategoryCount = (categoryId) => {
    const count = categoryStats[categoryId] || 0;
    // Format with 'k' for thousands
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleCategoryClick = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: "medium",
              mb: 1,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Browse by Category
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Explore items in different categories
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 0.25,
          }}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                onClick={() => handleCategoryClick(category.path)}
                sx={{
                  minWidth: { xs: "calc(50% - 1px)", sm: 150, md: 160 },
                  maxWidth: { xs: "calc(50% - 1px)", sm: 150, md: 160 },
                  height: { xs: 100, sm: 120 },
                  bgcolor: "background.paper",
                  color: "text.primary",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0.5,
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.5, sm: 1 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: { xs: 0.5, sm: 1 },
                  textTransform: "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    borderColor: theme.palette.primary.main,
                    zIndex: 1,
                    "& .MuiChip-root": {
                      bgcolor: "rgba(255, 255, 255, 0.3)",
                      color: "inherit",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "inherit",
                    },
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: { xs: 28, sm: 36 },
                    color: category.color,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "medium",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    lineHeight: 1.2,
                    textAlign: "center",
                  }}
                >
                  {category.name}
                </Typography>
                <Chip
                  label={getCategoryCount(category.id)}
                  size="small"
                  sx={{
                    height: { xs: 18, sm: 20 },
                    bgcolor: `${category.color}20`,
                    color: category.color,
                    fontWeight: "medium",
                    "& .MuiChip-label": {
                      px: { xs: 0.5, sm: 1 },
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    },
                  }}
                />
              </Button>
            );
          })}
        </Box>
      </Box>
    </Container>
  );
}

export default CategoriesGrid;
