import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * ShopMetricsCard Component
 *
 * PURPOSE: Display shop metrics (products, sales, revenue, rating)
 * USAGE: <ShopMetricsCard metrics={shopMetrics} rating={shopRating} loading={false} />
 */

function ShopMetricsCard({ metrics, rating, loading = false }) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const metricsData = [
    {
      label: "Total Products",
      value: metrics?.totalProducts || 0,
      color: theme.palette.primary.main,
    },
    {
      label: "Total Sales",
      value: metrics?.totalSales || 0,
      color: theme.palette.success.main,
    },
    {
      label: "Total Revenue",
      value: `RM ${(metrics?.totalRevenue || 0).toFixed(2)}`,
      color: theme.palette.info.main,
    },
    {
      label: "Average Rating",
      value: `${(rating?.averageRating || 0).toFixed(1)} / 5.0`,
      color: theme.palette.warning.main,
      subtitle: `${rating?.totalReviews || 0} reviews`,
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Shop Statistics
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 2,
              mt: 2,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Box key={i}>
                <Skeleton width="60%" height={24} />
                <Skeleton width="80%" height={32} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Shop Statistics
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 3,
          }}
        >
          {metricsData.map((metric, index) => (
            <Box key={index}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {metric.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: metric.color,
                }}
              >
                {metric.value}
              </Typography>
              {metric.subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {metric.subtitle}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default ShopMetricsCard;
