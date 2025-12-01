import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";

/**
 * InfoCard - Reusable card component for displaying information
 *
 * FEATURES:
 * - Flexible content (avatar, title, subtitle, chips, actions)
 * - Configurable hover effects and navigation
 * - Theme integration
 * - Accessibility support
 *
 * USAGE:
 * <InfoCard
 *   title="Profile"
 *   subtitle="Manage your information"
 *   avatar={<Avatar />}
 *   chips={[{ label: "Student", color: "primary" }]}
 *   actions={[{ icon: <Edit />, onClick: handleEdit }]}
 *   href="/profile/edit"
 *   variant="elevated"
 * />
 */
function InfoCard({
  title,
  subtitle,
  avatar,
  content,
  chips = [],
  actions = [],
  href,
  onClick,
  variant = "outlined", // "outlined" | "elevated" | "filled"
  hoverable = false,
  sx = {},
  ...props
}) {
  const { theme } = useTheme();

  const cardStyles = {
    outlined: {
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: "none",
    },
    elevated: {
      border: "none",
      boxShadow: theme.shadows[2],
    },
    filled: {
      border: "none",
      backgroundColor: theme.palette.background.paper,
      boxShadow: "none",
    },
  };

  const hoverStyles = hoverable
    ? {
        "&:hover": {
          bgcolor: theme.palette.action.hover,
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
          transition: "all 0.2s ease-in-out",
        },
      }
    : {};

  const CardWrapper = href ? Link : Box;
  const wrapperProps = href
    ? { to: href, style: { textDecoration: "none", color: "inherit" } }
    : { onClick };

  return (
    <CardWrapper {...wrapperProps}>
      <Card
        sx={{
          ...cardStyles[variant],
          ...hoverStyles,
          cursor: href || onClick ? "pointer" : "default",
          ...sx,
        }}
        {...props}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: avatar ? "column" : "row",
              alignItems: "center",
              gap: 2,
              mb: content || chips.length > 0 ? 2 : 0,
            }}
          >
            {/* Avatar */}
            {avatar && <Box sx={{ flexShrink: 0, mb: 1 }}>{avatar}</Box>}

            {/* Title & Subtitle */}
            <Box sx={{ flexGrow: 1, minWidth: 0, textAlign: "center" }}>
              {title && (
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                    mb: subtitle ? 0.5 : 0,
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>

            {/* Actions */}
            {actions.length > 0 && (
              <Box sx={{ display: "flex", gap: 1 }}>
                {actions.map((action, index) => (
                  <IconButton
                    key={index}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick?.(e);
                    }}
                    sx={{
                      color: action.color || "text.secondary",
                      "&:hover": {
                        color: action.hoverColor || theme.palette.primary.main,
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

          {/* Content Section */}
          {content && (
            <Box sx={{ mb: chips.length > 0 ? 2 : 0 }}>{content}</Box>
          )}

          {/* Chips Section */}
          {chips.length > 0 && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >
              {chips.map((chip, index) => (
                <Chip
                  key={index}
                  label={chip.label}
                  size={chip.size || "small"}
                  variant={chip.variant || "outlined"}
                  color={chip.color}
                  sx={{
                    borderColor: chip.color
                      ? `${chip.color}.main`
                      : theme.palette.divider,
                    color: chip.color ? `${chip.color}.main` : "text.secondary",
                    ...chip.sx,
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}

export default InfoCard;
