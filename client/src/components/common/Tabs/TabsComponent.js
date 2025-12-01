import React from "react";
import { Box, Tabs, Tab, Badge, Typography, Paper } from "@mui/material";

import { useTheme } from "../../../hooks/useTheme";

/**
 * TabsComponent - Reusable tabs with badges, icons, and descriptions
 *
 * FEATURES:
 * - Badge counts for each tab
 * - Icon support
 * - Custom descriptions
 * - Responsive design
 * - Theme integration
 *
 * USAGE:
 * <TabsComponent
 *   value={currentTab}
 *   onChange={handleTabChange}
 *   tabs={[
 *     {
 *       value: 'campus',
 *       label: 'Campus Addresses',
 *       description: 'Delivery within university campus',
 *       icon: <School />,
 *       badgeCount: 3
 *     }
 *   ]}
 *   variant="fullWidth"
 *   orientation="horizontal"
 * />
 */
function TabsComponent({
  value,
  onChange,
  tabs = [],
  variant = "fullWidth",
  orientation = "horizontal",
  showBadges = true,
  showDescriptions = true,
  showIcons = true,
  sx = {},
  tabSx = {},
  ...tabsProps
}) {
  const { theme } = useTheme();

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  const renderTabContent = (tab) => {
    const { label, description, icon, badgeCount } = tab;

    return (
      <Box sx={{ textAlign: "center", py: showDescriptions ? 1 : 0 }}>
        {showIcons && icon && (
          <Box sx={{ mb: showDescriptions ? 1 : 0 }}>
            {showBadges && badgeCount !== undefined ? (
              <Badge
                badgeContent={badgeCount}
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    right: -8,
                    top: 4,
                    fontSize: "0.75rem",
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                {icon}
              </Badge>
            ) : (
              icon
            )}
          </Box>
        )}

        <Typography
          variant="button"
          display="block"
          sx={{ textTransform: "none" }}
        >
          {label}
        </Typography>

        {showDescriptions && description && (
          <Typography variant="caption" color="text.secondary" display="block">
            {description}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Paper sx={sx}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant={variant}
        orientation={orientation}
        sx={{
          "& .MuiTabs-indicator": {
            height: 3,
          },
          ...tabsProps.sx,
        }}
        {...tabsProps}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={renderTabContent(tab)}
            sx={{
              minHeight: showDescriptions ? 80 : 48,
              "&.Mui-selected": {
                color: theme.palette.primary.main,
              },
              ...tabSx,
            }}
          />
        ))}
      </Tabs>
    </Paper>
  );
}

export default TabsComponent;
