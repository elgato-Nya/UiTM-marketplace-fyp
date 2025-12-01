import React from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  alpha,
} from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * InfoList - Reusable list component for displaying information
 *
 * FEATURES:
 * - Configurable list items with icons, labels, values, chips
 * - Optional actions per item
 * - Dividers and grouping support
 * - Theme integration
 * - Accessibility support
 *
 * USAGE:
 * <InfoList
 *   items={[
 *     {
 *       id: 'email',
 *       icon: <Email />,
 *       label: 'Email',
 *       value: 'user@example.com',
 *       chips: [{ label: 'Verified', color: 'success' }],
 *       actions: [{ icon: <Edit />, onClick: handleEdit }]
 *     }
 *   ]}
 *   showDividers={true}
 *   spacing="comfortable"
 * />
 */
function InfoList({
  items = [],
  showDividers = false,
  spacing = "default", // "compact" | "default" | "comfortable"
  sx = {},
}) {
  const { theme } = useTheme();

  const spacingMap = {
    compact: { my: 1, px: 0.5 },
    default: { my: 1.5, px: 1 },
    comfortable: { my: 2, px: 1.5 },
  };

  const itemSpacing = spacingMap[spacing];

  if (!items.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No items to display
      </Typography>
    );
  }

  return (
    <List disablePadding sx={sx}>
      {items.map((item, index) => {
        const {
          id,
          icon,
          label,
          value,
          chips = [],
          actions = [],
          onClick,
          href,
          disabled = false,
          dense = false,
        } = item;

        const isClickable = Boolean(onClick || href);
        const showDivider = showDividers && index < items.length - 1;

        return (
          <React.Fragment key={id || index}>
            <ListItem
              component={href ? "a" : "div"}
              href={href}
              onClick={onClick}
              disabled={disabled}
              sx={{
                px: 0,
                ...itemSpacing,
                cursor: isClickable ? "pointer" : "default",
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                "&:hover": isClickable
                  ? {
                      bgcolor: theme.palette.action.hover,
                    }
                  : {},
                opacity: disabled ? 0.6 : 1,
                textDecoration: href ? "none" : "inherit",
                color: "inherit",
              }}
              dense={dense}
            >
              {/* Icon */}
              {icon && (
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: disabled ? "text.disabled" : "primary.main",
                  }}
                >
                  {icon}
                </ListItemIcon>
              )}

              {/* Content */}
              <ListItemText
                slotProps={{
                  primary: {
                    variant: "body2",
                    sx: {
                      fontWeight: 500,
                      color: disabled ? "text.disabled" : "text.primary",
                    },
                  },
                  secondary: {
                    variant: "body2",
                    color: disabled ? "text.disabled" : "text.secondary",
                    component: "div",
                  },
                }}
                primary={
                  <Box
                    component="span"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box component="span">{label}</Box>

                    {/* Actions */}
                    {actions.length > 0 && (
                      <Box component="span" sx={{ display: "flex", gap: 0.5 }}>
                        {actions.map((action, actionIndex) => (
                          <IconButton
                            key={actionIndex}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick?.(e);
                            }}
                            disabled={disabled || action.disabled}
                            sx={{
                              color: "text.secondary",
                              "&:hover": {
                                color: theme.palette.primary.main,
                              },
                            }}
                            aria-label={action.label}
                          >
                            {action.icon}
                          </IconButton>
                        ))}
                      </Box>
                    )}
                  </Box>
                }
                secondary={
                  <Box component="div" sx={{ mt: 0.5 }}>
                    {/* Value */}
                    {value && (
                      <Box
                        component="span"
                        sx={{
                          display: "block",
                          mb: chips.length > 0 ? 1 : 0,
                          color: disabled ? "text.disabled" : "text.secondary",
                        }}
                      >
                        {value}
                      </Box>
                    )}

                    {/* Chips */}
                    {chips.length > 0 && (
                      <Box
                        component="div"
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {chips.map((chip, chipIndex) => (
                          <Chip
                            key={chipIndex}
                            label={chip.label}
                            size="small"
                            variant={chip.variant || "filled"}
                            color={chip.color}
                            icon={chip.icon}
                            sx={{
                              height: 20,
                              fontSize: "0.75rem",
                              bgcolor: chip.color
                                ? `${chip.color}.main`
                                : theme.palette.grey[100],
                              color: chip.color
                                ? `${chip.color}.contrastText`
                                : theme.palette.text.secondary,
                              "& .MuiChip-icon": {
                                color: "inherit",
                                fontSize: "0.875rem",
                              },
                              ...chip.sx,
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>

            {/* Divider */}
            {showDivider && (
              <Divider
                sx={{
                  my: 0.5,
                  borderColor: theme.palette.divider,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </List>
  );
}

export default InfoList;
