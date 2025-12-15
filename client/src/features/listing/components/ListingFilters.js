import { useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ShoppingBag,
  Build,
  ViewModule as AllIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import {
  LISTING_CATEGORIES,
  SORT_OPTIONS,
} from "../../../constants/listingConstant";
import { useTheme } from "../../../hooks/useTheme";

const ListingFilters = ({
  filters = {},
  onFilterChange,
  onReset,
  type = null,
  activeType = "all",
  onTypeChange,
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Determine available categories based on active type
  let categories = [];
  if (activeType === "product") {
    categories = LISTING_CATEGORIES.PRODUCT;
  } else if (activeType === "service") {
    categories = LISTING_CATEGORIES.SERVICE;
  } else {
    categories = [...LISTING_CATEGORIES.PRODUCT, ...LISTING_CATEGORIES.SERVICE];
  }

  // REMOVED: Auto-detect type from selected category
  // This was causing the category to be cleared when switching types

  // Check if current category is valid for the current type
  const isCategoryValid =
    !filters.category ||
    categories.some((cat) => cat.value === filters.category);

  // Use empty string if category is invalid to prevent MUI warning
  const safeCategory = isCategoryValid ? filters.category || "" : "";

  const handleSearchChange = (event) => {
    const searchValue = event.target.value;

    // Reset category when user starts typing in search bar
    if (filters.category) {
      onFilterChange?.({ search: searchValue, category: null });
    } else {
      onFilterChange?.({ search: searchValue });
    }
  };

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;

    // Fix: Handle empty string for "All Categories"
    onFilterChange?.({ category: selectedCategory || null });

    // No auto-switching of type - user controls the type toggle independently
  };

  const handleSortChange = (event) => {
    onFilterChange?.({ sort: event.target.value });
  };

  const handleClearSearch = () => {
    onFilterChange?.({ search: "" });
  };

  const handleReset = () => {
    onReset?.();
  };

  const handleTypeChangeWrapper = (event, newType) => {
    if (newType !== null && onTypeChange) {
      // Just pass to parent - BrowsePage handles clearing category/search
      onTypeChange(event, newType);
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.sort !== "-createdAt" ||
    activeType !== "all";

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        elevation={2}
        sx={{
          p: isMobile ? 1.5 : 2,
          borderRadius: 2,
        }}
      >
        <Stack spacing={isMobile ? 1.5 : 2}>
          {/* Type Toggle - Now integrated into filters */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 1 : 1.5,
              flexWrap: "nowrap",
              justifyContent: "space-between",
            }}
          >
            {/* Left side - Search placeholder on desktop, toggle on mobile */}
            {isMobile && (
              <ToggleButtonGroup
                value={activeType}
                exclusive
                onChange={handleTypeChangeWrapper}
                aria-label="listing type"
                size="small"
                sx={{
                  flex: 1,
                  "& .MuiToggleButtonGroup-grouped": {
                    border: 1,
                    borderColor: "divider",
                    "&:not(:first-of-type)": {
                      marginLeft: 0,
                      borderLeft: 1,
                      borderLeftColor: "divider",
                    },
                    "&:first-of-type": {
                      borderTopLeftRadius: 8,
                      borderBottomLeftRadius: 8,
                    },
                    "&:last-of-type": {
                      borderTopRightRadius: 8,
                      borderBottomRightRadius: 8,
                    },
                  },
                  "& .MuiToggleButton-root": {
                    px: 1,
                    py: 0.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    transition: "all 0.2s ease",
                    color: theme.palette.text.secondary,
                    flex: 1,
                    minWidth: 0,
                    "&.Mui-selected": {
                      bgcolor: theme.palette.primary.main,
                      color: "white",
                      borderColor: `${theme.palette.primary.main} !important`,
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                    },
                    "&:hover:not(.Mui-selected)": {
                      bgcolor: `${theme.palette.primary.main}10`,
                    },
                  },
                }}
              >
                <ToggleButton value="all" aria-label="all listings">
                  All
                </ToggleButton>
                <ToggleButton value="product" aria-label="products">
                  Products
                </ToggleButton>
                <ToggleButton value="service" aria-label="services">
                  Services
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* Right side - Type toggle and reset button on desktop */}
            {!isMobile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  ml: "auto",
                }}
              >
                <ToggleButtonGroup
                  value={activeType}
                  exclusive
                  onChange={handleTypeChangeWrapper}
                  aria-label="listing type"
                  size="medium"
                  sx={{
                    "& .MuiToggleButtonGroup-grouped": {
                      border: 1,
                      borderColor: "divider",
                      "&:not(:first-of-type)": {
                        marginLeft: 0,
                        borderLeft: 1,
                        borderLeftColor: "divider",
                      },
                      "&:first-of-type": {
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                      },
                      "&:last-of-type": {
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                      },
                    },
                    "& .MuiToggleButton-root": {
                      px: 2,
                      py: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      transition: "all 0.2s ease",
                      color: theme.palette.text.secondary,
                      minWidth: "auto",
                      "&.Mui-selected": {
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                        borderColor: `${theme.palette.primary.main} !important`,
                        "&:hover": {
                          bgcolor: theme.palette.primary.dark,
                        },
                      },
                      "&:hover:not(.Mui-selected)": {
                        bgcolor: `${theme.palette.primary.main}10`,
                      },
                    },
                  }}
                >
                  <ToggleButton value="all" aria-label="all listings">
                    <AllIcon sx={{ fontSize: 20, mr: 0.5 }} />
                    All
                  </ToggleButton>
                  <ToggleButton value="product" aria-label="products">
                    <ShoppingBag sx={{ fontSize: 20, mr: 0.5 }} />
                    Products
                  </ToggleButton>
                  <ToggleButton value="service" aria-label="services">
                    <Build sx={{ fontSize: 20, mr: 0.5 }} />
                    Services
                  </ToggleButton>
                </ToggleButtonGroup>

                <Divider orientation="vertical" flexItem />

                <Button
                  variant="text"
                  size="medium"
                  onClick={handleReset}
                  disabled={!hasActiveFilters}
                  startIcon={<CloseIcon />}
                  sx={{
                    minWidth: 100,
                    px: 2,
                    fontSize: "0.875rem",
                  }}
                >
                  Reset
                </Button>
              </Box>
            )}

            {/* Reset button for mobile */}
            {isMobile && (
              <IconButton
                size="small"
                onClick={handleReset}
                disabled={!hasActiveFilters}
                sx={{
                  minWidth: "auto",
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Search Bar */}
          <TextField
            fullWidth
            size={isMobile ? "small" : "medium"}
            placeholder={`Search ${activeType === "all" ? "listings" : activeType + "s"}...`}
            value={filters.search || ""}
            onChange={handleSearchChange}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.default",
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Category and Sort Filters - Single row on desktop */}
          <Stack
            direction="row"
            spacing={isMobile ? 1 : 2}
            sx={{
              flexWrap: "nowrap",
            }}
          >
            {/* Category Filter */}
            <FormControl
              fullWidth
              size={isMobile ? "small" : "medium"}
              sx={{
                minWidth: isMobile ? 0 : 200,
                flex: 1,
              }}
            >
              <InputLabel>Category</InputLabel>
              <Select
                value={safeCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">
                  All{" "}
                  {activeType === "all"
                    ? ""
                    : activeType.charAt(0).toUpperCase() +
                      activeType.slice(1)}{" "}
                  Categories
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort Filter */}
            <FormControl
              fullWidth
              size={isMobile ? "small" : "medium"}
              sx={{
                minWidth: isMobile ? 0 : 200,
                flex: 1,
              }}
            >
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sort || "-createdAt"}
                label="Sort By"
                onChange={handleSortChange}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {isMobile ? option.shortLabel : option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ListingFilters;
