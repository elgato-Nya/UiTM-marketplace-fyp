import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Remove,
  ChevronRight,
} from "@mui/icons-material";
import {
  getTrendDirection,
  getTrendColor,
} from "../../../constants/analyticsConstant";
import { useTheme } from "../../../hooks/useTheme";

/**
 * StatCard Component
 *
 * PURPOSE: Display statistical metrics with trend indicators in enterprise layout
 * PATTERN: Card with content on left, icon on right
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
  icon: IconComponent,
  color = "primary",
  subtitle = null,
  isLoading = false,
  sx = {},
  onClick = null,
  actionLabel = null,
  actionAriaLabel = null,
}) => {
  const { theme } = useTheme();
  const isInteractive = typeof onClick === "function";

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

  // Get icon background color
  const getIconBg = () => {
    const colors = {
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
    };
    return colors[color] + "15";
  };

  const getIconColor = () => {
    const colors = {
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
    };
    return colors[color];
  };

  const content = (
    <CardContent
      sx={{
        p: { xs: 2, md: 2.5 },
        "&:last-child": { pb: { xs: 2, md: 2.5 } },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, pr: 1.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              fontWeight: 500,
              fontSize: { xs: "0.75rem", md: "0.8125rem" },
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: change !== null || subtitle || isInteractive ? 0.75 : 0,
              fontSize: { xs: "1.5rem", md: "1.75rem" },
              lineHeight: 1.2,
            }}
          >
            {isLoading ? "..." : value}
          </Typography>

          {change !== null && !isLoading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <TrendIcon
                sx={{
                  fontSize: { xs: 14, md: 16 },
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
                  fontSize: { xs: "0.75rem", md: "0.8125rem" },
                }}
              >
                {Math.abs(change).toFixed(1)}%
              </Typography>
            </Box>
          )}

          {subtitle && !isLoading && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.7rem", md: "0.75rem" },
                mt: change !== null ? 0.5 : 0.75,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {isInteractive && !isLoading && (
            <Stack
              direction="row"
              spacing={0.25}
              alignItems="center"
              sx={{
                mt: 0.9,
                color: theme.palette.text.secondary,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", md: "0.8125rem" },
                }}
              >
                {actionLabel || "View"}
              </Typography>
              <ChevronRight sx={{ fontSize: { xs: 18, md: 20 } }} />
            </Stack>
          )}
        </Box>

        {IconComponent && (
          <Box
            sx={{
              width: { xs: 44, md: 52 },
              height: { xs: 44, md: 52 },
              borderRadius: 1.5,
              bgcolor: getIconBg(),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconComponent
              sx={{
                fontSize: { xs: 24, md: 28 },
                color: getIconColor(),
              }}
            />
          </Box>
        )}
      </Box>
    </CardContent>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
        },
        ...sx,
      }}
    >
      {isInteractive ? (
        <CardActionArea
          onClick={onClick}
          aria-label={actionAriaLabel || actionLabel || title}
          sx={{
            height: "100%",
            display: "block",
            textAlign: "left",
          }}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
};

export default StatCard;
