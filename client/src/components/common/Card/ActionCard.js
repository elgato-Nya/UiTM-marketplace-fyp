import React from "react";
import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";

/**
 * ActionCard - Reusable action card component
 *
 * FEATURES:
 * - Icon, title, description display
 * - Navigation support (Link or onClick)
 * - Hover effects and animations
 * - Theme integration
 * - Accessibility support
 *
 * USAGE:
 * <ActionCard
 *   icon={<Schedule />}
 *   title="My Orders"
 *   description="View order history"
 *   href="/orders"
 *   color="primary"
 * />
 */
function ActionCard({
  icon,
  title,
  description,
  href,
  onClick,
  color = "primary",
  disabled = false,
  sx = {},
}) {
  const { theme } = useTheme();

  const CardWrapper = href ? Link : Box;
  const wrapperProps = href
    ? {
        to: href,
        style: { textDecoration: "none", color: "inherit" },
        "aria-disabled": disabled,
      }
    : { onClick: disabled ? undefined : onClick };

  const colorValue = theme.palette[color]?.main || color;

  return (
    <CardWrapper {...wrapperProps}>
      <Card
        sx={{
          height: "100%",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "all 0.2s ease-in-out",
          "&:hover": disabled
            ? {}
            : {
                bgcolor: `${colorValue}08`,
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[4],
              },
          ...sx,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            height: "100%",
            py: 3,
            px: 2,
          }}
        >
          {/* Icon */}
          {icon && (
            <Box
              sx={{
                color: colorValue,
                mb: 1,
                "& > svg": {
                  fontSize: { xs: 28, sm: 32 },
                },
              }}
            >
              {icon}
            </Box>
          )}

          {/* Title */}
          {title && (
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: description ? 0.5 : 0,
                color: disabled ? "text.disabled" : "text.primary",
              }}
            >
              {title}
            </Typography>
          )}

          {/* Description */}
          {description && (
            <Typography
              variant="caption"
              color={disabled ? "text.disabled" : "text.secondary"}
              sx={{ lineHeight: 1.2 }}
            >
              {description}
            </Typography>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}

export default ActionCard;
