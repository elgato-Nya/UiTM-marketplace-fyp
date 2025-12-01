import React from "react";
import {
  Box,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "../../hooks/useTheme";
import { ShoppingBag, Build, Apps } from "@mui/icons-material";

function ListingTypeToggle({ value, onChange, stats = {} }) {
  const { theme, isAccessible } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Calculate totals from stats - use the pre-counted totals if available
  const productCount =
    stats.product_total ||
    Object.entries(stats)
      .filter(([key]) =>
        ["electronics", "clothing", "food", "books", "other"].includes(key)
      )
      .reduce((sum, [, count]) => sum + count, 0);

  const serviceCount =
    stats.service_total ||
    Object.entries(stats)
      .filter(([key]) =>
        [
          "printing",
          "repair",
          "e-hailing",
          "delivery",
          "other-service",
        ].includes(key)
      )
      .reduce((sum, [, count]) => sum + count, 0);

  const totalCount = productCount + serviceCount;

  const handleChange = (event, newType) => {
    if (newType !== null && onChange) {
      onChange(newType);
    }
  };

  // Format count with 'k' prefix for thousands
  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
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
          mb: 3,
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
            Browse by Listing Type
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Find products or services that match your needs
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={value}
          exclusive
          onChange={handleChange}
          aria-label="Listing Type"
          sx={{
            bgcolor: "background.paper",
            boxShadow: theme.shadows[1],
            flexWrap: isMobile ? "wrap" : "nowrap",
            justifyContent: "center",
            maxWidth: "100%",
            "& .MuiToggleButton-root": {
              border: "none",
              borderRadius: "8px !important",
              mx: isMobile ? 0.25 : 0.5,
              my: isMobile ? 0.25 : 0,
              px: isMobile ? 1.5 : 3,
              py: 1,
              fontSize: isMobile ? "0.7rem" : "0.875rem",
              "&.Mui-selected": {
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
              },
            },
          }}
        >
          <ToggleButton value="all">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 0.5 : 1,
              }}
            >
              <Apps fontSize="small" />
              {!isMobile && (
                <Typography variant="body2" fontWeight="medium">
                  All
                </Typography>
              )}
              <Chip
                label={formatCount(totalCount)}
                size="small"
                sx={{
                  bgcolor:
                    value === "all" ? "rgba(255,255,255,0.3)" : "default",
                  height: isMobile ? 20 : 24,
                  "& .MuiChip-label": {
                    px: isMobile ? 0.5 : 1,
                    fontSize: isMobile ? "0.7rem" : "0.8125rem",
                  },
                }}
              />
            </Box>
          </ToggleButton>

          <ToggleButton value="product">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 0.5 : 1,
              }}
            >
              <ShoppingBag fontSize="small" />
              {!isMobile && (
                <Typography variant="body2" fontWeight="medium">
                  Products
                </Typography>
              )}
              <Chip
                label={formatCount(productCount)}
                size="small"
                sx={{
                  bgcolor:
                    value === "product" ? "rgba(255,255,255,0.3)" : "default",
                  height: isMobile ? 20 : 24,
                  "& .MuiChip-label": {
                    px: isMobile ? 0.5 : 1,
                    fontSize: isMobile ? "0.7rem" : "0.8125rem",
                  },
                }}
              />
            </Box>
          </ToggleButton>

          <ToggleButton value="service">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 0.5 : 1,
              }}
            >
              <Build fontSize="small" />
              {!isMobile && (
                <Typography variant="body2" fontWeight="medium">
                  Services
                </Typography>
              )}
              <Chip
                label={formatCount(serviceCount)}
                size="small"
                sx={{
                  bgcolor:
                    value === "service" ? "rgba(255,255,255,0.3)" : "default",
                  height: isMobile ? 20 : 24,
                  "& .MuiChip-label": {
                    px: isMobile ? 0.5 : 1,
                    fontSize: isMobile ? "0.7rem" : "0.8125rem",
                  },
                }}
              />
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Container>
  );
}

export default ListingTypeToggle;
