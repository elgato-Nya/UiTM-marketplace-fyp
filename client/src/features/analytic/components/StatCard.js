import { Box, Typography, Chip, Avatar } from "@mui/material";
import { TrendingUp, TrendingDown, Remove } from "@mui/icons-material";
import InfoCard from "../../../components/common/Card/InfoCard";
import {
  formatNumber,
  getTrendDirection,
  getTrendColor,
} from "../../../constants/analyticsConstant";
import { useTheme } from "../../../hooks/useTheme";

/**
 * StatCard Component
 *
 * PURPOSE: Display statistical metrics with trend indicators
 * PATTERN: Extends InfoCard with stat-specific features
 *
 * @param {string} title - Stat title
 * @param {string|number} value - Main stat value
 * @param {number} change - Percentage change (can be positive or negative)
 * @param {string} trend - 'up' | 'down' | 'neutral' (auto-calculated if not provided)
 * @param {ReactNode} icon - Icon component
 * @param {string} color - 'primary' | 'success' | 'warning' | 'error' | 'info'
 * @param {string} subtitle - Optional subtitle
 * @param {boolean} isLoading - Loading state
 * @param {Object} sx - Additional styles
 */
const StatCard = ({
  title,
  value,
  change = null,
  trend = null,
  icon,
  color = "primary",
  subtitle = null,
  isLoading = false,
  sx = {},
}) => {
  const { theme } = useTheme();

  // Auto-calculate trend if not provided
  const trendDirection =
    trend || (change !== null ? getTrendDirection(change) : "neutral");
  const trendColor = getTrendColor(change);

  // Get trend icon
  const TrendIcon =
    trendDirection === "up"
      ? TrendingUp
      : trendDirection === "down"
        ? TrendingDown
        : Remove;

  return (
    <InfoCard
      title={title}
      content={
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Main Value */}
          <Typography
            variant="h4"
            component="div"
            fontWeight="bold"
            sx={{
              color: theme.palette.text.primary,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" },
            }}
          >
            {isLoading ? "..." : value}
          </Typography>

          {/* Trend Indicator */}
          {change !== null && !isLoading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexWrap: "wrap",
              }}
            >
              <TrendIcon
                sx={{
                  fontSize: { xs: 14, sm: 16 },
                  color:
                    theme.palette[trendColor]?.main ||
                    theme.palette.text.secondary,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color:
                    theme.palette[trendColor]?.main ||
                    theme.palette.text.secondary,
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                {Math.abs(change).toFixed(1)}%
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}

          {/* Subtitle without trend */}
          {subtitle && change === null && !isLoading && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      }
      avatar={
        <Avatar
          sx={{
            bgcolor: theme.palette[color]?.main || theme.palette.primary.main,
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
          }}
        >
          {icon}
        </Avatar>
      }
      variant="elevated"
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
        ...sx,
      }}
    />
  );
};

export default StatCard;
