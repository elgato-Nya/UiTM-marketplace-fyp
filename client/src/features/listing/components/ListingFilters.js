import { useEffect, useMemo, useState } from "react";
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
  Collapse,
  Chip,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ShoppingBag,
  Build,
  ViewModule as AllIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
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
  activeType = "all",
  onTypeChange,
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || "");

  let categories = [];
  if (activeType === "product") {
    categories = LISTING_CATEGORIES.PRODUCT;
  } else if (activeType === "service") {
    categories = LISTING_CATEGORIES.SERVICE;
  } else {
    categories = [...LISTING_CATEGORIES.PRODUCT, ...LISTING_CATEGORIES.SERVICE];
  }

  const isCategoryValid =
    !filters.category ||
    categories.some((cat) => cat.value === filters.category);

  const safeCategory = isCategoryValid ? filters.category || "" : "";

  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const trimmedSearch = searchInput.trim();
    const currentSearch = filters.search || "";

    if (trimmedSearch === currentSearch) {
      return undefined;
    }

    if (trimmedSearch.length === 1) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      if (filters.category) {
        onFilterChange?.({ search: trimmedSearch, category: null });
      } else {
        onFilterChange?.({ search: trimmedSearch });
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, filters.search, filters.category, onFilterChange]);

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    onFilterChange?.({ category: selectedCategory || null });
  };

  const handleSortChange = (event) => {
    onFilterChange?.({ sort: event.target.value });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    if (filters.search || filters.category) {
      onFilterChange?.({ search: "", category: null });
    } else {
      onFilterChange?.({ search: "" });
    }
  };

  const handleReset = () => {
    onReset?.();
  };

  const handleTypeChangeWrapper = (event, newType) => {
    if (newType !== null && onTypeChange) {
      onTypeChange(event, newType);
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.sort !== "-createdAt" ||
    activeType !== "all";

  const secondaryActiveFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count += 1;
    if (filters.sort && filters.sort !== "-createdAt") count += 1;
    return count;
  }, [filters.category, filters.sort]);

  const mobileFilterSummary =
    secondaryActiveFilterCount > 0 ? `${secondaryActiveFilterCount} active` : "";

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 0.75 : 1.5,
              flexWrap: "nowrap",
              justifyContent: "space-between",
            }}
          >
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
                    transition: "all 0.2s ease",
                    color: theme.palette.text.secondary,
                    flex: 1,
                    minWidth: 0,
                    "&.Mui-selected": {
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      borderColor: `${theme.palette.primary.main} !important`,
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                    },
                    "&:hover:not(.Mui-selected)": {
                      bgcolor: "action.hover",
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
                      transition: "all 0.2s ease",
                      color: theme.palette.text.secondary,
                      minWidth: "auto",
                      "&.Mui-selected": {
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        borderColor: `${theme.palette.primary.main} !important`,
                        "&:hover": {
                          bgcolor: theme.palette.primary.dark,
                        },
                      },
                      "&:hover:not(.Mui-selected)": {
                        bgcolor: "action.hover",
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
                  }}
                >
                  Reset
                </Button>
              </Box>
            )}
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 0.75,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Search listings
            </Typography>

            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              placeholder={`Search ${activeType === "all" ? "listings" : activeType + "s"}...`}
              value={searchInput}
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
                  endAdornment: searchInput && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {isMobile ? (
            <>
              <Button
                variant="outlined"
                onClick={() => setMobileFiltersOpen((prev) => !prev)}
                endIcon={mobileFiltersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                aria-expanded={mobileFiltersOpen}
                aria-controls="mobile-browse-filters"
                aria-label={
                  mobileFiltersOpen ? "Collapse browse filters" : "Expand browse filters"
                }
                sx={{
                  justifyContent: "space-between",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 1.25,
                  py: 1,
                  borderRadius: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  <Box component="span">Filters</Box>
                  {mobileFilterSummary && (
                    <Chip
                      component="span"
                      size="small"
                      label={mobileFilterSummary}
                      color="primary"
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontWeight: 600,
                        "& .MuiChip-label": { px: 0.9 },
                      }}
                    />
                  )}
                </Box>
              </Button>

              <Collapse
                in={mobileFiltersOpen}
                timeout="auto"
                unmountOnExit
                id="mobile-browse-filters"
              >
                <Stack spacing={1.25} sx={{ pt: 0.25 }}>
                  <Stack direction="column" spacing={1}>
                    <FormControl fullWidth size="small">
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

                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={filters.sort || "-createdAt"}
                        label="Sort By"
                        onChange={handleSortChange}
                      >
                        {SORT_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.shortLabel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                      pt: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                      {filters.category && (
                        <Chip
                          size="small"
                          label="Category set"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {filters.sort && filters.sort !== "-createdAt" && (
                        <Chip
                          size="small"
                          label="Custom sort"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Button
                      variant="text"
                      size="small"
                      onClick={handleReset}
                      disabled={!hasActiveFilters}
                      startIcon={<CloseIcon />}
                      sx={{
                        textTransform: "none",
                        flexShrink: 0,
                      }}
                    >
                      Reset all
                    </Button>
                  </Box>
                </Stack>
              </Collapse>
            </>
          ) : (
            <Stack direction="row" spacing={2} sx={{ flexWrap: "nowrap" }}>
              <FormControl
                fullWidth
                size="medium"
                sx={{
                  minWidth: 200,
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

              <FormControl
                fullWidth
                size="medium"
                sx={{
                  minWidth: 200,
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
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ListingFilters;
