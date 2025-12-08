import React from "react";
import {
  Box,
  Tabs,
  Tab,
  Badge,
  Typography,
  Paper,
  useMediaQuery,
} from "@mui/material";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  const renderTabContent = (tab) => {
    const { label, shortLabel, description, icon, badgeCount } = tab;

    // Use shortLabel on mobile if available, hide descriptions on mobile
    const displayLabel = isMobile && shortLabel ? shortLabel : label;
    const shouldShowDescription = showDescriptions && !isMobile;

    return (
      <Box sx={{ textAlign: "center", py: shouldShowDescription ? 1 : 0.5 }}>
        {showIcons && icon && (
          <Box sx={{ mb: shouldShowDescription ? 1 : 0.5 }}>
            {showBadges && badgeCount !== undefined ? (
              <Badge
                badgeContent={badgeCount}
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    right: -8,
                    top: 4,
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    minWidth: { xs: 16, sm: 18 },
                    height: { xs: 16, sm: 18 },
                  },
                }}
              >
                {React.cloneElement(icon, {
                  sx: { fontSize: { xs: 20, sm: 24 } },
                })}
              </Badge>
            ) : (
              React.cloneElement(icon, {
                sx: { fontSize: { xs: 20, sm: 24 } },
              })
            )}
          </Box>
        )}

        <Typography
          variant="button"
          display="block"
          sx={{
            textTransform: "none",
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            fontWeight: { xs: 500, sm: 600 },
          }}
        >
          {displayLabel}
        </Typography>

        {shouldShowDescription && description && (
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
            height: { xs: 2, sm: 3 },
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
              minHeight: { xs: 64, sm: showDescriptions ? 80 : 48 },
              px: { xs: 1, sm: 2 },
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
