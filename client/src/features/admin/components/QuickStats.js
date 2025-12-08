import { Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import {
  People,
  PersonAdd,
  Store,
  AttachMoney,
  Warning,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import {
  formatCurrency,
  formatNumber,
} from "../../../constants/analyticsConstant";

/**
 * QuickStats Component
 *
 * PURPOSE: Display key platform statistics in card format
 * FEATURES:
 * - Responsive grid layout (2x2 mobile, 4x1 desktop)
 * - Color-coded stat cards
 * - Trend indicators
 * - Pending verification alerts
 * - Super admin GMV display
 *
 * ACCESSIBILITY:
 * - Proper ARIA labels for screen readers
 * - Semantic HTML (article for each stat card)
 * - Role attributes for interactive elements
 *
 * RESPONSIVE:
 * - Mobile: 2 columns
 * - Tablet: 2 columns
 * - Desktop: 4 columns
 */
const QuickStats = ({
  data,
  pendingVerifications,
  isLoading,
  isSuperAdmin,
}) => {
  const { theme } = useTheme();

  // Show empty state instead of hiding when no data
  const safeData = data || {};

  const stats = [
    {
      title: "Total Users",
      value: formatNumber(safeData.users?.total || 0),
      icon: People,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light + "20",
      growth: safeData.users?.growthRate,
      ariaLabel: `Total users: ${safeData.users?.total || 0}. Growth rate: ${safeData.users?.growthRate || 0}%`,
    },
    {
      title: "Active Today",
      value: formatNumber(safeData.users?.activeToday || 0),
      icon: PersonAdd,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light + "20",
      subtitle: safeData.users?.total
        ? `${((safeData.users.activeToday / safeData.users.total) * 100).toFixed(1)}% of total`
        : "No data",
      ariaLabel: `Active users today: ${safeData.users?.activeToday || 0}`,
    },
    {
      title: "Total Merchants",
      value: formatNumber(safeData.users?.merchants || 0),
      icon: Store,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light + "20",
      subtitle: `${safeData.merchants?.pendingVerification || 0} pending`,
      badge: pendingVerifications?.pendingVerifications > 0 && {
        count: pendingVerifications.pendingVerifications,
        color: "warning",
      },
      ariaLabel: `Total merchants: ${safeData.users?.merchants || 0}. ${safeData.merchants?.pendingVerification || 0} pending verification`,
    },
  ];

  // Add GMV stat for super admins only
  if (isSuperAdmin && safeData.orders?.gmv) {
    stats.push({
      title: "GMV (Total Revenue)",
      value: formatCurrency(safeData.orders.gmv),
      icon: AttachMoney,
      color: theme.palette.secondary.main,
      bgColor: theme.palette.secondary.light + "20",
      growth: safeData.orders.gmvGrowthRate,
      ariaLabel: `Gross Merchandise Value: ${formatCurrency(safeData.orders.gmv)}. Growth rate: ${safeData.orders.gmvGrowthRate || 0}%`,
    });
  }

  return (
    <section aria-labelledby="quick-stats-heading">
      <Typography
        id="quick-stats-heading"
        variant="h6"
        sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}
      >
        Platform Overview
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const hasGrowth = stat.growth !== undefined && stat.growth !== null;
          const isPositiveGrowth = hasGrowth && stat.growth > 0;

          return (
            <Grid size={{ xs: 6, md: 4 }} key={index}>
              <Card
                component="article"
                elevation={0}
                aria-label={stat.ariaLabel}
                sx={{
                  height: "100%",
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                    borderColor: stat.color,
                  },
                }}
              >
                <CardContent>
                  {/* Icon and Badge Row */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: stat.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      role="img"
                      aria-label={`${stat.title} icon`}
                    >
                      <IconComponent sx={{ color: stat.color, fontSize: 28 }} />
                    </Box>

                    {/* Alert Badge for Pending Verifications */}
                    {stat.badge && (
                      <Chip
                        icon={<Warning sx={{ fontSize: 16 }} />}
                        label={stat.badge.count}
                        size="small"
                        color={stat.badge.color}
                        aria-label={`${stat.badge.count} items requiring attention`}
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500, textAlign: "center" }}
                  >
                    {stat.title}
                  </Typography>

                  {/* Value */}
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      mb: hasGrowth || stat.subtitle ? 1 : 0,
                      textAlign: "center",
                    }}
                  >
                    {stat.value}
                  </Typography>

                  {/* Growth Indicator or Subtitle */}
                  {hasGrowth && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                      role="status"
                      aria-label={`Growth: ${isPositiveGrowth ? "up" : "down"} ${Math.abs(stat.growth)} percent`}
                    >
                      {isPositiveGrowth ? (
                        <TrendingUp
                          sx={{
                            fontSize: 16,
                            color: theme.palette.success.main,
                          }}
                        />
                      ) : (
                        <TrendingDown
                          sx={{ fontSize: 16, color: theme.palette.error.main }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: isPositiveGrowth
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                          fontWeight: 600,
                          textAlign: "center",
                        }}
                      >
                        {Math.abs(stat.growth).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}

                  {stat.subtitle && !hasGrowth && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem", textAlign: "center" }}
                    >
                      {stat.subtitle}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </section>
  );
};

export default QuickStats;
