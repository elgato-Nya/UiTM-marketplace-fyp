import { Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import {
  People,
  PersonAdd,
  Store,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Inventory,
  VerifiedUser,
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
      iconColor: theme.palette.primary.main,
      iconBg: theme.palette.primary.main + "15",
      growth: safeData.users?.growthRate,
      ariaLabel: `Total users: ${safeData.users?.total || 0}. Growth rate: ${safeData.users?.growthRate || 0}%`,
    },
    {
      title: "Active Listings",
      value: formatNumber(safeData.listings?.active || 0),
      icon: Inventory,
      iconColor: theme.palette.success.main,
      iconBg: theme.palette.success.main + "15",
      subtitle: safeData.listings?.total
        ? `${((safeData.listings.active / safeData.listings.total) * 100).toFixed(0)}% available`
        : "No listings",
      ariaLabel: `Active listings: ${safeData.listings?.active || 0} out of ${safeData.listings?.total || 0} total`,
    },
    {
      title: "Verified Merchants",
      value: formatNumber(safeData.merchants?.verified || 0),
      icon: VerifiedUser,
      iconColor: theme.palette.info.main,
      iconBg: theme.palette.info.main + "15",
      subtitle: `${safeData.merchants?.pendingVerification || 0} pending`,
      badge: pendingVerifications?.pendingVerifications > 0 && {
        count: pendingVerifications.pendingVerifications,
      },
      ariaLabel: `Verified merchants: ${safeData.merchants?.verified || 0}. ${safeData.merchants?.pendingVerification || 0} pending verification`,
    },
    {
      title: "Active Today",
      value: formatNumber(safeData.users?.activeToday || 0),
      icon: PersonAdd,
      iconColor: theme.palette.warning.main,
      iconBg: theme.palette.warning.main + "15",
      subtitle: safeData.users?.total
        ? `${((safeData.users.activeToday / safeData.users.total) * 100).toFixed(1)}% engagement`
        : "No data",
      ariaLabel: `Active users today: ${safeData.users?.activeToday || 0}`,
    },
  ];

  // Add GMV stat for super admins only
  if (isSuperAdmin && safeData.orders?.gmv) {
    stats.push({
      title: "GMV (Total Revenue)",
      value: formatCurrency(safeData.orders.gmv),
      icon: AttachMoney,
      iconColor: theme.palette.secondary.main,
      iconBg: theme.palette.secondary.main + "15",
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

      <Grid container spacing={{ xs: 1.5, md: 2 }}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const hasGrowth = stat.growth !== undefined && stat.growth !== null;
          const isPositiveGrowth = hasGrowth && stat.growth > 0;

          return (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <Card
                component="article"
                elevation={0}
                aria-label={stat.ariaLabel}
                sx={{
                  height: "100%",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                  },
                }}
              >
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
                    {/* Left side - Content */}
                    <Box sx={{ flex: 1, minWidth: 0, pr: 1.5 }}>
                      {/* Title */}
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
                        {stat.title}
                      </Typography>

                      {/* Value */}
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          mb: hasGrowth || stat.subtitle ? 0.75 : 0,
                          fontSize: { xs: "1.5rem", md: "1.75rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {stat.value}
                      </Typography>

                      {/* Growth Indicator */}
                      {hasGrowth && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {isPositiveGrowth ? (
                            <TrendingUp
                              sx={{
                                fontSize: { xs: 14, md: 16 },
                                color: theme.palette.success.main,
                              }}
                            />
                          ) : (
                            <TrendingDown
                              sx={{
                                fontSize: { xs: 14, md: 16 },
                                color: theme.palette.error.main,
                              }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              color: isPositiveGrowth
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                              fontWeight: 600,
                              fontSize: { xs: "0.75rem", md: "0.8125rem" },
                            }}
                          >
                            {Math.abs(stat.growth).toFixed(1)}%
                          </Typography>
                        </Box>
                      )}

                      {/* Subtitle */}
                      {stat.subtitle && !hasGrowth && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}
                        >
                          {stat.subtitle}
                        </Typography>
                      )}

                      {/* Badge for pending items */}
                      {stat.badge && (
                        <Chip
                          label={`${stat.badge.count} pending`}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: { xs: 20, md: 22 },
                            fontSize: { xs: "0.65rem", md: "0.7rem" },
                            fontWeight: 600,
                            bgcolor: theme.palette.warning.light + "30",
                            color: theme.palette.warning.dark,
                          }}
                        />
                      )}
                    </Box>

                    {/* Right side - Icon */}
                    <Box
                      sx={{
                        width: { xs: 44, md: 52 },
                        height: { xs: 44, md: 52 },
                        borderRadius: 1.5,
                        bgcolor: stat.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent
                        sx={{
                          fontSize: { xs: 24, md: 28 },
                          color: stat.iconColor,
                        }}
                      />
                    </Box>
                  </Box>
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
