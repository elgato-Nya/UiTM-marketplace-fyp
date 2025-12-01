import React from "react";
import { Box, Tabs, Tab, Badge, useMediaQuery } from "@mui/material";
import {
  HourglassEmpty,
  CheckCircle,
  Loop,
  LocalShipping,
  Assignment,
  Cancel,
  ViewList,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * OrderStatusFilter Component
 *
 * PURPOSE: Tab-based filter for order status with counts
 * FEATURES:
 * - Visual status indicators with icons
 * - Badge counts for each status
 * - Responsive design
 * - Accessible tabs
 *
 * @param {string} currentStatus - Currently selected status filter
 * @param {function} onStatusChange - Callback when status filter changes
 * @param {Object} statusCounts - Count of orders for each status
 */
function OrderStatusFilter({
  currentStatus,
  onStatusChange,
  statusCounts = {},
}) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const statusTabs = [
    { value: "", label: "All Orders", icon: <ViewList />, color: "default" },
    {
      value: "pending",
      label: "Pending",
      icon: <HourglassEmpty />,
      color: "warning",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      icon: <CheckCircle />,
      color: "info",
    },
    {
      value: "processing",
      label: "Processing",
      icon: <Loop />,
      color: "info",
    },
    {
      value: "shipped",
      label: "Shipped",
      icon: <LocalShipping />,
      color: "primary",
    },
    {
      value: "delivered",
      label: "Delivered",
      icon: <Assignment />,
      color: "success",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      icon: <Cancel />,
      color: "error",
    },
  ];

  const handleChange = (event, newValue) => {
    if (onStatusChange) {
      onStatusChange(newValue);
    }
  };

  const getTabLabel = (tab) => {
    const count = statusCounts[tab.value] || 0;
    if (isMobile) {
      // On mobile, show only icon with badge
      return (
        <Badge
          badgeContent={count}
          color={tab.color}
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.7rem",
              height: 18,
              minWidth: 18,
            },
          }}
        >
          {tab.icon}
        </Badge>
      );
    }

    // On desktop, show label with badge
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {tab.icon}
        {tab.label}
        {count > 0 && (
          <Badge
            badgeContent={count}
            color={tab.color}
            max={999}
            sx={{
              "& .MuiBadge-badge": {
                position: "relative",
                transform: "none",
                fontSize: "0.7rem",
                height: 20,
                minWidth: 20,
                ml: 0.5,
              },
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        mb: { xs: 2, sm: 3 },
        overflowX: "auto",
        "&::-webkit-scrollbar": {
          height: 6,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.divider,
          borderRadius: 3,
        },
      }}
    >
      <Tabs
        value={currentStatus}
        onChange={handleChange}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
        aria-label="Order status filter tabs"
        sx={{
          minHeight: { xs: 48, sm: 56 },
          "& .MuiTab-root": {
            minHeight: { xs: 48, sm: 56 },
            minWidth: { xs: 60, sm: 100 },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            textTransform: "none",
            fontWeight: 500,
          },
          "& .Mui-selected": {
            fontWeight: 600,
          },
        }}
      >
        {statusTabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={getTabLabel(tab)}
            icon={isMobile ? null : undefined}
            iconPosition="start"
            aria-label={`Filter by ${tab.label}`}
          />
        ))}
      </Tabs>
    </Box>
  );
}

export default OrderStatusFilter;
