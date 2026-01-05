import { memo } from "react";
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  alpha,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

import { useTheme } from "../../hooks/useTheme";

/**
 * ListingFormSection Component
 *
 * PURPOSE: Reusable expandable/collapsible section for listing forms
 * PATTERN: Follows MerchantAnalyticsPage collapsible pattern
 *
 * FEATURES:
 * - Expandable/collapsible content
 * - Completion status indicator
 * - Error state display
 * - Optional badge count
 * - Accessible (keyboard navigation, ARIA)
 * - Mobile-responsive
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Optional subtitle/description
 * @param {React.ReactNode} props.icon - Section icon
 * @param {React.ReactNode} props.children - Section content
 * @param {boolean} props.expanded - Whether section is expanded
 * @param {function} props.onToggle - Toggle expand/collapse callback
 * @param {boolean} props.isComplete - Whether section is complete
 * @param {boolean} props.hasError - Whether section has validation errors
 * @param {number} props.badgeCount - Optional count badge (e.g., images count)
 * @param {boolean} props.optional - Whether section is optional
 * @param {boolean} props.disabled - Disable interaction
 */
const ListingFormSection = memo(function ListingFormSection({
  title,
  subtitle,
  icon,
  children,
  expanded = true,
  onToggle,
  isComplete = false,
  hasError = false,
  badgeCount,
  optional = false,
  disabled = false,
}) {
  const { theme } = useTheme();

  // Determine header background based on state
  const getHeaderStyles = () => {
    if (hasError) {
      return {
        bgcolor: alpha(theme.palette.error.main, 0.08),
        borderColor: theme.palette.error.main,
      };
    }
    if (isComplete) {
      return {
        bgcolor: alpha(theme.palette.success.main, 0.08),
        borderColor: theme.palette.success.main,
      };
    }
    return {
      bgcolor: alpha(theme.palette.primary.main, 0.04),
      borderColor: theme.palette.divider,
    };
  };

  const headerStyles = getHeaderStyles();

  // Status indicator
  const renderStatusIndicator = () => {
    if (hasError) {
      return (
        <Tooltip title="This section has errors">
          <ErrorIcon
            sx={{
              color: theme.palette.error.main,
              fontSize: 20,
            }}
          />
        </Tooltip>
      );
    }
    if (isComplete) {
      return (
        <Tooltip title="Section complete">
          <CheckCircleIcon
            sx={{
              color: theme.palette.success.main,
              fontSize: 20,
            }}
          />
        </Tooltip>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: headerStyles.borderColor,
        borderRadius: 2,
        overflow: "hidden",
        transition: "border-color 0.2s ease",
        mb: 2,
        "&:last-child": { mb: 0 },
      }}
    >
      {/* Section Header */}
      <Box
        component="button"
        type="button"
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
        aria-expanded={expanded}
        aria-controls={`section-content-${title.toLowerCase().replace(/\s/g, "-")}`}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          p: { xs: 2, md: 2.5 },
          bgcolor: headerStyles.bgcolor,
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          transition: "background-color 0.2s ease",
          "&:hover": {
            bgcolor: disabled
              ? headerStyles.bgcolor
              : alpha(theme.palette.primary.main, 0.08),
          },
          "&:focus-visible": {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
          },
        }}
      >
        {/* Left side: Icon + Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: hasError
                  ? theme.palette.error.main
                  : isComplete
                    ? theme.palette.success.main
                    : theme.palette.primary.main,
                fontSize: { xs: 22, md: 24 },
                "& > svg": {
                  fontSize: "inherit",
                  color: "inherit",
                },
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.primary"
                sx={{ fontSize: { xs: "0.95rem", md: "1rem" } }}
              >
                {title}
              </Typography>
              {optional && (
                <Chip
                  label="Optional"
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    color: "text.secondary",
                    borderColor: "divider",
                  }}
                />
              )}
              {badgeCount !== undefined && badgeCount > 0 && (
                <Chip
                  label={badgeCount}
                  size="small"
                  color={isComplete ? "success" : "primary"}
                  sx={{ height: 20, fontSize: "0.75rem", minWidth: 24 }}
                />
              )}
            </Box>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                  fontSize: { xs: "0.8rem", md: "0.85rem" },
                  display: { xs: expanded ? "none" : "block", md: "block" },
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right side: Status + Expand button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {renderStatusIndicator()}
          <Tooltip title={expanded ? "Collapse section" : "Expand section"}>
            <IconButton
              component="span"
              size="small"
              disabled={disabled}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Section Content */}
      <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit={false}
        id={`section-content-${title.toLowerCase().replace(/\s/g, "-")}`}
      >
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            pt: { xs: 1.5, md: 2 },
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
});

ListingFormSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  isComplete: PropTypes.bool,
  hasError: PropTypes.bool,
  badgeCount: PropTypes.number,
  optional: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default ListingFormSection;
